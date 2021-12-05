const DEGREES_CELSIUS 		= ' &#176;C ';
const WALK_GLYPH      		= ' &#128694; ';
const RUN_GLYPH       		= ' &#127939; ';
const BUS_GLYPH 	  		= ' &#128652; ';
const TRAIN_GLYPH     		= ' &#128646; ';
const SPACE_CHARACTER 		= '&nbsp;';
const A_MINUTE				=  60;
const FIVE_MINUTES 			= A_MINUTE * 5
const TEN_MINUTES 			= A_MINUTE * 10
const FIFTEEN_MINUTES		= A_MINUTE * 15
const HALF_AN_HOUR 			= A_MINUTE * 30
const AN_HOUR				= A_MINUTE * 60;
const TWELVE_HOURS			= AN_HOUR * 12;
const TWENTY_FOUR_HOURS		= AN_HOUR * 24;

var runtime_config = null;

function get_request_param( param_id ){
    let paramString = window.location.search.substring(1);
    let keyValuePair = paramString.split('&');
    for(var i = 0; i < keyValuePair.length; i++ ){
        let keyValue = keyValuePair[i].split("=");
        if( keyValue[0] === param_id ){
            return keyValue[1];
        }
    }
}

function log_debug(  message, remove_after_seconds ){
    let debugging = get_request_param('debug');
    if(debugging){
        log_info( 'DEBUG: ' + message, remove_after_seconds );
    }
}

function log_info( message, remove_after_seconds ){
    write_message( message, "text-info", remove_after_seconds  );
}

function log_error( message, remove_after_seconds ){
    write_message( message, "text-danger border-top border-bottom p-1", remove_after_seconds  );
}

function log_warn( message, remove_after_seconds ){
    write_message( message, "text-warning", remove_after_seconds  );
}


function add_message_div_if_missing(){
    let userMessagesDiv = $("#user-messages");
    if( userMessagesDiv.length === 0 ){
        let messageDiv = $("#user-messages-div");
        messageDiv.removeClass('d-none');
        messageDiv.html(  '<ul class="list-unstyled" id="user-messages"/>' );
    }
}

function write_unit_test_result( message, pass ){
    let aClass = pass ?  'text-success' : 'text-danger';
    write_message( message, aClass, -1 , true );
}

function write_html_message( message, aClass, remove_after_seconds ){
    write_message( message, aClass, remove_after_seconds, true );
}

function write_message( message, aClass, removeAfterSeconds, asHtml ){
    let removeTime = removeAfterSeconds ? now_plus_seconds(removeAfterSeconds) : now_plus_seconds( 5 );
    let now = new Date();
    let timedMessage = (' [' + get_padded_time_seconds( now ) + '] ' + message);
    add_message_div_if_missing();
    console.log( timedMessage );
    let li = '<li class="'+ aClass + '" remove-time="'+ removeTime +'">';
    if( asHtml ){
        li += timedMessage;
    }else{
        li += '<xmp>' +  timedMessage + '</xmp>'
    }
    li += '</li>';

    $("#user-messages").append( li );
}

function remove_overdue_messages(){
    let userMessage = $("#user-messages");
    userMessage.children().each( function( index, it ){
        let removeTime = new Date( $(it).attr("remove-time"));
        let secondsSince = get_seconds_since(removeTime);
        if( secondsSince > 0 ){
            it.remove();
        }
    });
    if( userMessage.children().length === 0 ){
        let userMessageDiv = $("#user-messages-div");
        userMessageDiv.html('');
        userMessageDiv.addClass('d-none');
    }
}

function colour_special_fields( field, regex ){
    if(field.match( regex )){
        return '<span class="text-success">' + field + '</span>';
    }else{
        return field;
    }
}


function get_runtime_config(){

    let runtimeConfigUrl = "data/runtime-config.json";

    if(is_debug_on()){
        runtimeConfigUrl = "test-data/debug-runtime-config.json";
    }

    if( !runtime_config ){
        $.ajax({
                url: runtimeConfigUrl ,
                type: "GET",
                async: false,
                success: function( data ) {
                    runtime_config = data;
                },
                error: function ( xhr ){
                    if(xhr && (xhr.status === 404)) {
                        console.log( "Ignoring 404 for runtime-config.json" );
                    }else{
                        log_error( ' Error getting js/runtime-config.json ( Unknown error ).');
                    }
                }
            });
    }
    if( runtime_config ){
        $.ajax({
                url: "data/station-codes.json",
                type: "GET",
                async: false,
                success: function( data ) {
                    let entries = Object.entries(data);
                    let entry;
                    let nameToCode = new Map();
                    let codeToName = new Map();

                    for (var i = 0; i < entries.length; i++ ){
                        entry = entries[i];
                        nameToCode.set( entry[0], entry[1] );
                        codeToName.set( entry[1], entry[0] );
                    };
                    runtime_config.transport.stationCodeToNameMap = codeToName;
                    runtime_config.transport.stationNameToCodeMap = nameToCode;
                },
                error: function ( xhr ){
                    if(xhr && (xhr.status === 404)) {
                        console.log( "Ignoring 404 for runtime-config.json" );
                    }else{
                        log_error( ' Error getting js/runtime-config.json ( Unknown error ).');
                    }
                }
            });
    }

    if(runtime_config){
        if(is_debug_on()){
            set_times_from_strings( runtime_config.schoolRunCountDown );
        } else {
            update_to_todays_dates( runtime_config.schoolRunCountDown );
        }
    }


    return runtime_config;
}

function update_to_todays_dates( schoolRunCountDown ){
    let s = schoolRunCountDown;
    s.showCountDown = set_time_on_date( new Date(), s.showCountDown );
    s.startCountDown = set_time_on_date( new Date(), s.startCountDown );
    s.departureTime = set_time_on_date( new Date(), s.departureTime );
    s.stopCountDown = set_time_on_date( new Date(), s.stopCountDown );
}


function set_times_from_strings( schoolRunCountDown ){
    let s = schoolRunCountDown;
    s.showCountDown = time_from_string( s.showCountDown );
    s.startCountDown = time_from_string( s.startCountDown );
    s.departureTime = time_from_string( s.departureTime );
    s.stopCountDown = time_from_string( s.stopCountDown );
}


function build_time_boundaries( tooEarly, plentyOfTime, moveQuickerTime, almostOutOfTime, date ){
    let deadLine = new Date(date);
    let timeBoundaries = {}
    timeBoundaries.tooEarly = tooEarly;
    timeBoundaries.plentyOfTime = plentyOfTime;
    timeBoundaries.moveQuickerTime = moveQuickerTime;
    timeBoundaries.almostOutOfTime = almostOutOfTime;
    timeBoundaries.deadLine = deadLine;
    return timeBoundaries;
}




