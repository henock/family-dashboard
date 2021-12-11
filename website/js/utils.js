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

var runtimeConfig = null;

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
    console.trace();
    write_message( message, "text-danger border-top border-bottom p-1", remove_after_seconds  );
}

function log_warn( message, remove_after_seconds ){
    console.trace();
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

    if( !runtimeConfig ){
        $.ajax({
                url: runtimeConfigUrl ,
                type: "GET",
                async: false,
                success: function( data ) {
                    runtimeConfig = data;
                },
                error: function ( xhr ){
                    log_error( ' Error getting ' + runtimeConfigUrl + ' errorStatus: ' + xhr.status );
                }
            });
        if( runtimeConfig ){
            let getUrl = "data/station-codes.json";
            $.ajax({
                    url: getUrl,
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
                        runtimeConfig.transport.stationCodeToNameMap = codeToName;
                        runtimeConfig.transport.stationNameToCodeMap = nameToCode;
                    },
                    error: function ( xhr ){
                        log_error( ' Error getting '+ getUrl + ' errorStatus: ' + xhr.status );
                    }
                });

            getUrl = "data/api-keys.json";
            $.ajax({
                    url: getUrl,
                    type: "GET",
                    async: false,
                    success: function( data ) {
                        runtimeConfig.apiKeys = data;
                    },
                    error: function ( xhr ){
                        log_error( ' Error getting ' + getUrl + ' xhr.status: ' + xhr.status );
                    }
                });
        }
    }
    return runtimeConfig;
}


function build_time_boundaries_for_school_run( schoolRunCountDown ){
    let tooEarly = schoolRunCountDown.getOutOfBedBy;
    let plentyOfTime = schoolRunCountDown.finishGettingDressedBy;
    let moveQuickerTime = schoolRunCountDown.finishBreakfastBy;
    let almostOutOfTime = schoolRunCountDown.putOnShoesBy;
    let departureTime = date_from_string( schoolRunCountDown.departureTime )
    let timeBoundaries =  build_time_boundaries( tooEarly, plentyOfTime, moveQuickerTime, almostOutOfTime, departureTime );
    return timeBoundaries;
}


function build_time_boundaries( tooEarly, plentyOfTime, moveQuickerTime, almostOutOfTime, date ){
    let deadLine = new Date(date);
    let timeBoundaries = {}
    let tooEarlyDate = date_from_string( tooEarly, deadLine );
    let plentyOfTimeDate = date_from_string( plentyOfTime, deadLine )
    let moveQuickerTimeDate = date_from_string( moveQuickerTime, deadLine )
    let almostOutOfTimeDate = date_from_string( almostOutOfTime, deadLine )
    timeBoundaries.tooEarly = get_seconds_between_dates( tooEarlyDate , deadLine );
    timeBoundaries.plentyOfTime = get_seconds_between_dates( plentyOfTimeDate , deadLine );
    timeBoundaries.moveQuickerTime = get_seconds_between_dates( moveQuickerTimeDate , deadLine );
    timeBoundaries.almostOutOfTime = get_seconds_between_dates( almostOutOfTimeDate , deadLine );
    timeBoundaries.deadLine = deadLine;
    return timeBoundaries;
}




