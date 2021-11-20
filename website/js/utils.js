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

function log_error( message, remove_after_seconds ){
    write_message( message, "text-danger border-top border-bottom p-1", remove_after_seconds  );
}

function log_warn( message, remove_after_seconds ){
    write_message( message, "text-warning", remove_after_seconds  );
}

function log_info( message, remove_after_seconds ){
    write_message( message, "text-info", remove_after_seconds  );
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


function get_runtime_config(){
    if( !runtime_config ){
        $.ajax({
                url: "js/runtime-config.json",
                type: "GET",
                async: false,
                success: function( data ) {
                    console.log( data );
                    runtime_config = data;
                },
                error: function ( xhr , something ){
                    log_error( xhr.status +' Error getting js/runtime-config.json ('+xhr.responseJSON.message +').');
                }
            });
    }

    return runtime_config;
}