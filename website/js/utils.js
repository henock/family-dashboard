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
    if(is_debug_on()){
        log_info( 'DEBUG: ' + message, remove_after_seconds );
    }
}

function log_info( message, remove_after_seconds ){
    write_message( message, "text-info", remove_after_seconds, false );
}

function log_error( message, remove_after_seconds ){
    console.trace( message );
    write_message( message, "text-danger border-top border-bottom p-1", remove_after_seconds, false );
}

function log_warn( message, remove_after_seconds ){
    console.trace( message );
    write_message( message, "text-warning", remove_after_seconds, false  );
}

function add_message_div_if_missing(){
    let messageDiv = $("#user-messages-div");
    messageDiv.removeClass('d-none');
    if( messageDiv.length === 0 ){
        messageDiv.html(  '<ul class="list-unstyled" id="user-messages"/>' );
    }
}

function write_html_message( message, aClass, remove_after_seconds ){
    write_message( message, aClass, remove_after_seconds, true );
}

function write_to_console( message ){
    let timedMessage = (' [' + get_padded_time_milli_seconds( clock.get_Date() ) + '] ' + message);
    console.log( timedMessage );
}

function write_message( message, aClass, removeAfterSeconds, asHtml ){
    let removeTime = removeAfterSeconds ? now_plus_seconds(removeAfterSeconds) : now_plus_seconds( 5 );
    let now = clock.get_Date();
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
    let userMessageList = $("#user-messages");
    userMessageList.children().each( function( index, it ){
        let removeTime = new Date( $(it).attr("remove-time"));
        let secondsSince = get_seconds_since(removeTime);
        if( secondsSince > 0 ){
            it.remove();
        }
    });
    if( userMessageList.children().length === 0 ){
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

function calculate_progress_bar_percentage( startTimeStamp, endTimeStamp, currentTimeStamp ){
    if( currentTimeStamp < startTimeStamp || currentTimeStamp > endTimeStamp ){
        return 0;
    } else {
        let deNominator = ( endTimeStamp - startTimeStamp);
        let nominator = (endTimeStamp - currentTimeStamp );
        let percentage = 100 - (Math.floor((nominator / deNominator) * 100));
        return percentage;
    }
}

function generate_next_download_count_down_values( nextDownloadDataTime, updateEvery, time ){
    time = time ? time : clock.get_Date();
    startTimeStamp = date_plus_seconds( nextDownloadDataTime, updateEvery * -1 );
    let percentage = calculate_progress_bar_percentage( startTimeStamp.getTime(), nextDownloadDataTime.getTime(), time.getTime() );
    let countDownTime = display_time_period_from_seconds_into_future(get_seconds_until( nextDownloadDataTime ));
    return {
        timeLeft: countDownTime,
        percentage: percentage
    }
}

function set_next_download_count_down_elements( elementId, countDown ){
    $("#" + elementId ).html( countDown.timeLeft );
    $("#" + elementId + "-progress-bar").attr( "style", "width: " + countDown.percentage + "%" );
}

function get_class_for_boundary_window( boundaryWindow ){
    switch( boundaryWindow.name){
        case TOO_EARLY:
        case GO_BACK_TO_BED:
            return 'primary';
        case PLENTY_OF_TIME:
        case EAT_YOUR_BREAKFAST:
            return 'danger';
        case MOVE_QUICKER_TIME:
        case GET_DRESSED:
            return 'warning';
        case ALMOST_OUT_OF_TIME:
        case PUT_ON_YOUR_SHOES:
            return 'success';
        case OUT_OF_TIME: return 'secondary';
        default: return '';
    }
}

function get_remote_data( urlToGet, runAsync, model, success_response_parser_function, fail_response_parser_function ){

    function default_process_error( xhr ){
        if( xhr ){
            log_error( xhr.status +': Error calling ' + urlToGet + ', got the response  ('+xhr.responseText +').');
        } else{
            log_error( ' Error calling ' + urlToGet + ' ( Unknown error ).');
        }
    }

    $.ajax({
        url: urlToGet,
        type: "GET",
        async: runAsync,
        success: function( data ) {
            return success_response_parser_function( model, data );
        },
        error: function ( xhr ){
            if( fail_response_parser_function ) {
                fail_response_parser_function( model , xhr , default_process_error);
            }else{
                default_process_error( xhr );
            }
        }
    });
}




