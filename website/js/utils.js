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
    var paramString = window.location.search.substring(1);
    var keyValuePair = paramString.split('&');
    for(var i = 0; i < keyValuePair.length; i++ ){
        var keyValue = keyValuePair[i].split("=");
        if( keyValue[0] === param_id ){
            return keyValue[1];
        }
    }
}

function log_debug(  message, remove_after_seconds ){
    var debugging = get_request_param('debug');
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
    var userMessagesDiv = $("#user-messages");
    if( userMessagesDiv.length === 0 ){
        let messageDiv = $("#user-messages-div");
        messageDiv.removeClass('d-none');
        messageDiv.html(  '<ul class="list-unstyled" id="user-messages"/>' );
    }
}

function write_message( message, a_class, remove_after_seconds ){
    var removeTime = remove_after_seconds ? now_plus_seconds(remove_after_seconds) : now_plus_seconds( 5 );
    var now = new Date();
    var timedMessage = ' [' + get_padded_time_seconds( now ) + '] ' + message ;
    add_message_div_if_missing();
    console.log( timedMessage );
    $("#user-messages").append(
        '<li class="'+ a_class + '" remove-time="'+ removeTime +'">' +  timedMessage + '</li>'
    );
}

function remove_overdue_messages(){
    let userMessage = $("#user-messages");
    userMessage.children().each( function( index, it ){
        var removeTime = new Date( $(it).attr("remove-time"));
        var secondsSince = get_seconds_since(removeTime);
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


function get_runtime_config( dontLog404s ){

    let runtimeConfigUrl = "js/runtime-config.json";

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
                    if(xhr && (xhr.status === 404) && dontLog404s ) {
                        console.log( "Ignoring 404 for runtime-config.json" );
                    } else if(xhr){
                        log_error( xhr.status +' Error getting js/runtime-config.json ('+xhr.responseText +').');
                    }else{
                        log_error( ' Error getting js/runtime-config.json ( Unknown error ).');
                    }
                }
            });
    }
    if( runtime_config ){
        $.ajax({
                url: "js/station-codes.json",
                type: "GET",
                async: false,
                success: function( data ) {
                    runtime_config.transport.stationCodeToNameMap = data;
                },
                error: function ( xhr ){
                    if(xhr && (xhr.status === 404) && dontLog404s ) {
                        console.log( "Ignoring 404 for runtime-config.json" );
                    } else if(xhr){
                        log_error( xhr.status +' Error getting js/runtime-config.json ('+xhr.responseText +').');
                    }else{
                        log_error( ' Error getting js/runtime-config.json ( Unknown error ).');
                    }
                }
            });
    }

    if(is_debug_on()){
        set_times_from_strings( runtime_config.schoolRunCountDown );
    } else {
        update_to_todays_dates( runtime_config.schoolRunCountDown );
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


