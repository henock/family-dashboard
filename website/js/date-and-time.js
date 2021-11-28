

function set_date_and_time() {
    var now = new Date();
    var monthAsString = now.toLocaleString('default', { month: 'short' })   //TODO - DO THIS LOCAL THING BETTER

    var date = now.getDate() + ' ' + monthAsString + '. ' + now.getFullYear();
    var time = get_padded_time_seconds( now );
    var local_time_zone = (now.isDstObserved() ? ' (British Summer Time)' : 'GMT');

    $("#date").html( date );
    $("#local-time").html( time );
    $("#local-time-zone").html( local_time_zone );
}

function update_times_in_different_timezone(){
    if( familyDashboard.config.timeZone ){
        let timeZones = familyDashboard.runtimeConfig.timeZones;
        set_date_time_for_time_zone(timeZones.one.id, timeZones.one.name, "#time-zone-1")
        set_date_time_for_time_zone(timeZones.two.id, timeZones.two.name, "#time-zone-2")
    }
}

function set_date_time_for_time_zone( time_zone_id , time_zone_name ,  element_id_prefix ){
    $.ajax({
        url: "http://worldtimeapi.org/api/timezone/" + time_zone_id ,
        type: "GET",
        success: function( data ) {
            var time = data.datetime.split("T")[1].split('.')[0].substring(0,5);
            $( element_id_prefix + "-name" ).html( time_zone_name );
            $( element_id_prefix + "-time").html( time );
        },
        error: function ( xhr ){
            if( xhr ){
                log_error( xhr.status +' Error calling worldtimeapi with timezone '+time_zone_id+ ' ('+xhr.responseText +').');
            } else{
                log_error( 'Error calling worldtimeapi with timezone '+time_zone_id+ ' ( Unknown error ).');
            }
            return 'api_error';
        }
    });
}

function pad_with_leading_zero( num ){
    if( num < 10 && num > -1 ){
        return '0' + num;
    } else {
        return num;
    }
}

function pad_with_leading_spaces( full_length, a_string ){
    var len = a_string.length;
    for (var i = len; i < full_length; i++) {
        a_string = SPACE_CHARACTER + a_string;
    }
    return a_string;
}

function now_plus_seconds( seconds_to_add ){
    return date_plus_seconds( new Date(), seconds_to_add );
}

function date_plus_seconds( date, seconds_to_add ){
    if( !date || ! (date instanceof Date) ){
        log_error( "date_plus_seconds() date was null - using now");
        date = new Date();
    }
    return new Date( date.getTime() + (seconds_to_add * 1000));
}

function get_seconds_between_dates( date_a, date_b ){
    if( !date_a || ! (date instanceof Date) ){
        log_error( "get_seconds_between_dates() date_a was null - using now");
        date_a = new Date();
    }
    if( !date_b || ! (date instanceof Date) ){
        log_error( "get_seconds_between_dates() date_b was null - using now");
        date_b = new Date();
    }
    return Math.floor((date_a.getTime() - date_b.getTime()) / 1000);
}

function get_seconds_since( date ){
    if( !date || ! (date instanceof Date) ){
        log_error( "get_seconds_since() date was null - using now");
        date = new Date();
    }
    var now = (new Date()).getTime();
    return Math.floor((now - date.getTime()) / 1000);
}

function get_seconds_until( date ){
    if( !date || ! (date instanceof Date) ){
        log_error( "get_seconds_until() date was null - using now");
        date = new Date();
    }
    return get_seconds_since( date )  * -1;
}

function get_padded_time_minutes( date ){
    date = date ? date : new Date();
    var time = 	pad_with_leading_zero(date.getHours()) + ':' +
                pad_with_leading_zero(date.getMinutes());
    return time;
}

function get_padded_time_seconds( date ){
    date = date ? date : new Date();
    var time = 	get_padded_time_minutes(date) + ':' +
                pad_with_leading_zero(date.getSeconds());
    return time;
}

Date.prototype.stdTimezoneOffset = function () {
    var jan = new Date(this.getFullYear(), 0, 1);
    var jul = new Date(this.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}

Date.prototype.isDstObserved = function () {
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
}

function display_time_period_from_seconds( seconds ){
    seconds = Math.abs(seconds);
    var minutesIntoFuture = (seconds/60);
    var displayTime;
    if( minutesIntoFuture > 59 ){
        var hoursIntoTheFuture = parseFloat(minutesIntoFuture/60).toFixed(2);
        var minutesLeft = minutesIntoFuture%60;
        displayTime =  Math.floor(hoursIntoTheFuture) + 'h ' + pad_with_leading_zero(Math.floor(minutesLeft));
    } else if( minutesIntoFuture > 1 ){
        seconds = (seconds % 60);
        displayTime = pad_with_leading_zero(Math.floor(minutesIntoFuture)) + '.' + pad_with_leading_zero(Math.floor(seconds));
    }else{
        seconds = pad_with_leading_zero(Math.floor(seconds));
        displayTime = '00.' + seconds;
    }
    return displayTime;
}

function set_time_on_date( date, timeAsString ){
    var hours =  timeAsString.split(":")[0];
    var minutes =  timeAsString.split(":")[1];
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
}

function update_all_count_down_times(){

    $(".transit-departure-time").each(function(index, element){
        var arrivalTime = new Date($(element).attr("scheduled-time"));
        var noNeedToLeaveBefore = $(element).attr("noNeedToLeaveBefore");
        var walkTransitTime = $(element).attr("walkTransitTime");
        var runTransitTime = $(element).attr("runTransitTime");
        var driveTransitTime = $(element).attr("driveTransitTime");
        element.innerHTML = build_transport_eta_html( build_transport_eta_spans, arrivalTime, noNeedToLeaveBefore, walkTransitTime, runTransitTime, driveTransitTime, 5);
    });

    $(".refresh-time").each(function(index,element){
        var id = $(element).attr('id');
        var refreshTime = new Date($(element).attr("next-refresh-time"));
        var refreshPeriodInMillis = $(element).attr("refresh-period-in-seconds") * 1000;
        var futureInMillis = (refreshTime.getTime() - (new Date()).getTime());
        var futureInSeconds = futureInMillis/1000;
        var nextRefreshTimeForDisplay = display_time_period_from_seconds( futureInSeconds );
        $(element).html( nextRefreshTimeForDisplay );
        var progressBarPercentage = futureInMillis / refreshPeriodInMillis * 100;
        $(  '#' + id + '-progress-bar' ).attr('style', 'width: ' + (100 - progressBarPercentage) + '%');
    });
}

function date_with_dashes( date ){
    date = date ? date : new Date();
    var day = pad_with_leading_zero(date.getDate());
    var month = pad_with_leading_zero(date.getMonth()+1);
    var year = date.getFullYear();
    return  year + '-' + month + '-' + day;
}

//str = "now+20s"
function time_from_string( str ){
    if( str.includes("+")){
        split = str.split("+");
        let prefix = split[0];
        let suffix = split[1];
        if( suffix.endsWith( 's' )){
            let seconds = suffix.substring(0, suffix.length-1);
            if( prefix.toLowerCase() === "now" ){
                return date_plus_seconds( new Date(), seconds );
            }
        }
    }
}
