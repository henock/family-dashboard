

const SPACE_CHARACTER 		= '&nbsp;';


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