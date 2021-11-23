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
    if( userMessagesDiv.length == 0 ){
        $("#user-messages-div").html(  '<ul class="list-unstyled" id="user-messages"/>' );
    }
}

function write_message( message, a_class, remove_after_seconds ){
    var removeTime = remove_after_seconds ? now_plus_seconds(remove_after_seconds) : now_plus_seconds(600);
    var now = new Date();
    var timedMessage = ' [' + get_padded_time_seconds( now ) + '] ' + message ;
    add_message_div_if_missing();
    console.log( timedMessage );
    $("#user-messages").append(
        '<li class="'+ a_class + '" remove-time="'+ removeTime +'">' +  timedMessage + '</li>'
    );
}

function remove_overdue_messages(){
    $("#user-messages").children().each( function( index, it ){
        var removeTime = new Date( $(it).attr("remove-time"));
        var secondsSince = get_seconds_since(removeTime);
        if( secondsSince > 0 ){
            it.remove();
        }
    });
    if( $("#user-messages").children().length == 0 ){
        $("#user-messages-div").html('');
    }
}

function is_check_box_checked( checkbox_id ){
    return $('#' + checkbox_id + ':checkbox:checked').length > 0
}


function colour_special_fields( field, regex ){
    if(field.match( regex )){
        return '<span class="text-success">' + field + '</span>';
    }else{
        return field;
    }
}


function get_runtime_config(){

    if( !runtime_config ){
        $.ajax({
                url: "js/runtime-config.json",
                type: "GET",
                async: false,
                success: function( data ) {
                    runtime_config = data;
                },
                error: function ( xhr , something ){
                    if(xhr){
                        log_error( xhr.status +' Error getting js/runtime-config.json ('+xhr.responseText +').');
                    }else{
                        log_error( ' Error getting js/runtime-config.json ( Unknown error ).');
                    }
                }
            });

        $.ajax({
                url: "js/station-codes.json",
                type: "GET",
                async: false,
                success: function( data ) {
                    runtime_config.transport.stationCodeToNameMap = data;
                },
                error: function ( xhr , something ){
                    if(xhr){
                        log_error( xhr.status +' Error getting js/runtime-config.json ('+xhr.responseText +').');
                    }else{
                        log_error( ' Error getting js/runtime-config.json ( Unknown error ).');
                    }
                }
            });
    }

    return runtime_config;
}