

function set_date_and_time() {
    let now = new Date();
    let monthAsString = now.toLocaleString('default', { month: 'short' })   //TODO - DO THIS LOCAL THING BETTER

    let date = now.getDate() + ' ' + monthAsString + '. ' + now.getFullYear();
    let time = get_padded_time_seconds( now );
    let local_time_zone = (now.isDstObserved() ? ' (British Summer Time)' : 'GMT');

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
            let time = data.datetime.split("T")[1].split('.')[0].substring(0,5);
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
    let len = a_string.length;
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
    let now = (new Date()).getTime();
    return Math.floor((now - date.getTime()) / 1000);
}

function get_seconds_until( date ){
    date.getMinutes();
    if( !date || ! (date instanceof Date) ){
        log_error( "get_seconds_until() date was null - using now");
        date = new Date();
    }
    return get_seconds_since( date )  * -1;
}

function get_padded_time_minutes( date ){
    date = date ? date : new Date();
    let time = 	pad_with_leading_zero(date.getHours()) + ':' +
                pad_with_leading_zero(date.getMinutes());
    return time;
}

function get_padded_time_seconds( date ){
    date = date ? date : new Date();
    let time = 	get_padded_time_minutes(date) + ':' +
                pad_with_leading_zero(date.getSeconds());
    return time;
}

Date.prototype.stdTimezoneOffset = function () {
    let jan = new Date(this.getFullYear(), 0, 1);
    let jul = new Date(this.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}

Date.prototype.isDstObserved = function () {
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
}

function display_time_period_from_seconds_into_future( seconds ){
    seconds = Math.abs(seconds);
    let hoursIntoFuture = Math.floor((seconds/3600));
    let minutesIntoFuture = (Math.floor((seconds/60)) % 60 );
    if( hoursIntoFuture > 0 ){ //not gonna show seconds
        let hours = pad_with_leading_zero(hoursIntoFuture);
        if( minutesIntoFuture > 0 ){
            let mins = pad_with_leading_zero(minutesIntoFuture);
            return SPACE_CHARACTER + hours + 'h' + SPACE_CHARACTER + mins + 'm';
        }else{
            return  SPACE_CHARACTER + SPACE_CHARACTER + SPACE_CHARACTER + SPACE_CHARACTER + SPACE_CHARACTER + hours + 'h';
        }
    }else{
        let secs = pad_with_leading_zero((seconds % 60));
        if( minutesIntoFuture > 0 ){
            let mins = pad_with_leading_zero(minutesIntoFuture);
            return  SPACE_CHARACTER +  SPACE_CHARACTER +  SPACE_CHARACTER  + mins + ':' + secs
        } else {
            return  SPACE_CHARACTER +  SPACE_CHARACTER +  SPACE_CHARACTER  +  SPACE_CHARACTER + SPACE_CHARACTER +  SPACE_CHARACTER +  secs + 's'
        }
    }
}

function set_time_on_date( date, timeAsString ){
    let hours =  timeAsString.split(":")[0];
    let minutes =  timeAsString.split(":")[1];
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
}

function update_all_count_down_times(){
    $(".transit-departure-time").each(function(index, element){
        let timeBoundaries = {}
        let transportId = new Date($(element).attr("transport-id"));
        let departureTime = new Date($(element).attr("scheduled-time"));
        timeBoundaries.tooEarly = $(element).attr("noNeedToLeaveBefore");
        timeBoundaries.plentyOfTime = $(element).attr("walkTransitTime");
        timeBoundaries.moveQuickerTime = $(element).attr("runTransitTime");
        timeBoundaries.almostOutOfTime = $(element).attr("driveTransitTime");
        timeBoundaries.deadLine = departureTime;
        element.innerHTML = build_transport_eta_countdown_element( timeBoundaries, transportId );
    });

    $(".refresh-time").each(function(index,element){
        let id = $(element).attr('id');
        let refreshTime = new Date($(element).attr("next-refresh-time"));
        let refreshPeriodInMillis = $(element).attr("refresh-period-in-seconds") * 1000;
        let futureInMillis = (refreshTime.getTime() - (new Date()).getTime());
        let futureInSeconds = futureInMillis/1000;
        let nextRefreshTimeForDisplay = display_time_period_from_seconds_into_future( Math.floor(futureInSeconds));
        $(element).html( nextRefreshTimeForDisplay );
        let progressBarPercentage = futureInMillis / refreshPeriodInMillis * 100;
        $(  '#' + id + '-progress-bar' ).attr('style', 'width: ' + (100 - progressBarPercentage) + '%');
    });
}

function date_with_dashes( date ){
    date = date ? date : new Date();
    let day = pad_with_leading_zero(date.getDate());
    let month = pad_with_leading_zero(date.getMonth()+1);
    let year = date.getFullYear();
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
