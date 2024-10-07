

const SPACE_CHARACTER 		= '&nbsp;';


function getUrlParameter( paramToGet ){
    let searchParams = new URLSearchParams( window.location.search );
    return searchParams.get(paramToGet);
}

function isDebugOn(){
    runningInDebugMode = ("true" === getUrlParameter("debug"));
    return runningInDebugMode;
}

function padWithLeadingSpaces( fullLength, aString ){
    let len = aString.length;
    for (var i = len; i < fullLength; i++) {
        aString = SPACE_CHARACTER + aString;
    }
    return aString;
}

function padWithLeadingZero( num ){
     if( num < 10 && num > -1 ){
         return '0' + num;
     } else {
         return num;
     }
}

//TODO - Refactor to split out UI from logic
function writeMessage( message, aClass, removeAfterSeconds, asHtml ){
    let removeTime = (removeAfterSeconds ? nowPlusSecond(removeAfterSeconds) : nowPlusSecond( 5 ));
    let now = dashboardDate;
    let timedMessage = (" [" + getPaddedTimeSeconds( now ) + "] " + message);
//    addMessageDivIfMissing();
    console.log( timedMessage );
    let li = `<li ${(aClass? "class='"+aClass+"'" : "")} remove-time="${removeTime.getTime()}">`;
    if( asHtml ){
        li += timedMessage;
    }else{
        li += "<xmp>" +  timedMessage + "</xmp>";
    }
    li += "</li>";

    $("#user-messages").append( li );

    return li;
}

function logDebug(  message, removeAfterSeconds ){
    if(runningInDebugMode){
        return writeMessage( message, "text-secondary", removeAfterSeconds, false );
    }else{
        return "";
    }
}

function logInfo( message, removeAfterSeconds ){
    return writeMessage( message, "text-info", removeAfterSeconds, false );
}

function logWarn( message, removeAfterSeconds ){
    console.trace( message );
    return writeMessage( message, "text-warning", removeAfterSeconds, false  );
}

function logError( message, removeAfterSeconds ){
    console.trace( message );
    return writeMessage( message, "text-danger p-1", removeAfterSeconds, false );
}

function getRemoteData( urlToGet ){
    let data = '';
    $.ajax({
        url: urlToGet,
        type: "GET",
        async: false,
        success: function( response ) {
            data = response;
        },
        error: function ( xhr ){
            if( xhr ){
                logError( xhr.status +': Error calling ' + urlToGet + ', got the response  ('+xhr.responseText +').');
            } else{
                logError( ' Error calling ' + urlToGet + ' ( Unknown error ).');
            }
        }
    });
    return data;
}
