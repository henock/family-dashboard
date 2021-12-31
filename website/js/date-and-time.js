
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
    return date_plus_milli_seconds( date , (seconds_to_add * 1000));
}

function date_plus_milli_seconds( date, millis_to_add ){
    return new Date( date.getTime() + millis_to_add );
}

function get_seconds_between_dates( date_a, date_b ){
    if( !date_a || ! (date_a instanceof Date) ){
        log_error( "get_seconds_between_dates() date_a was null - using now");
        date_a = new Date();
    }
    if( !date_b || ! (date_b instanceof Date) ){
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
    if( !date || ! (date instanceof Date) ){
        log_error( "get_seconds_until() date was null - using now");
        date = new Date();
    }
    return get_seconds_since( date )  * -1;
}

function get_padded_time_minutes( date ){
    if( !date || ! (date instanceof Date) ){
        log_error( "get_padded_time_minutes() date was null - using now");
        date = new Date();
    }
    let time = 	pad_with_leading_zero(date.getHours()) + ':' +
                pad_with_leading_zero(date.getMinutes());
    return time;
}

function get_padded_time_milli_seconds( date ){
    date = date ? date : new Date();
    let time = 	get_padded_time_minutes(date) + ':' +
                pad_with_leading_zero(date.getSeconds()) + ':' +
                date.getMilliseconds();
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
            return  SPACE_CHARACTER +  SPACE_CHARACTER +  SPACE_CHARACTER  +  SPACE_CHARACTER + SPACE_CHARACTER  +  secs + 's'
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
    $(".transport-departure-time").each(function(index, element){
        let timeBoundaries = {}
        let transportId = $(element).attr("transport-id");
        timeBoundaries.tooEarly = $(element).attr("tooEarly");
        timeBoundaries.plentyOfTime = $(element).attr("plentyOfTime");
        timeBoundaries.moveQuickerTime = $(element).attr("moveQuickerTime");
        timeBoundaries.almostOutOfTime = $(element).attr("almostOutOfTime");
        timeBoundaries.deadLine = new Date($(element).attr("deadLine"));
        let transportType = $(element).attr("transportType");
        element.innerHTML = build_transport_eta_countdown_element( timeBoundaries, transportId, transportType );
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
    if( !date || ! (date instanceof Date) ){
        log_error( "date_with_dashes() date was null - using now");
        date = new Date();
    }
    let day = pad_with_leading_zero(date.getDate());
    let month = pad_with_leading_zero(date.getMonth()+1);
    let year = date.getFullYear();
    return  year + '-' + month + '-' + day;
}

//str = 'now+20s' OR 'Fri 31 Dec 2021 13:24:14 GMT'
function date_from_string_only( str, date ){
    date = date ? date : new Date();
    if(str.includes( "now" ) || str.includes( "departure" )){
        return calculate_relative_date( str, date );
    } else {
        return new Date( str );
    }
}

//str = "now+20s" OR "departure-10m"
function date_from_string( str , date ){
    date = date ? date : new Date();
    if( str instanceof Date ){
        return str;
    } else if(str.includes( "now" ) || str.includes( "departure" )){
        return calculate_relative_date( str, date );
    }else{
        return set_time_on_date( date , str );
    }
}

function calculate_relative_date( relativeString, date ){
    let isPlus = relativeString.includes("+");
    let splitPos = (isPlus ?  relativeString.indexOf('+') : relativeString.indexOf('-'));
    let amount = relativeString.substring( splitPos +1, relativeString.length-1 );
    let timeStep = relativeString.substring( relativeString.length-1 );
    switch(timeStep){
        case 's': multiple=1;break;
        case 'm': multiple=60;break;
        case 'h': multiple=3600;break;
        default: {
            multiple=1;
            log_error( 'Invalid string passed into date_from_string function expected "[now|departure][+|-]{int}[s|m|h]" got: "' + relativeString + '"' );
        }
    }
    seconds = (amount * multiple)
    seconds *= isPlus ? 1 : -1;
    return date_plus_seconds( date, seconds );
}

//str = "departure-10m"
function seconds_from_string( str ){
    if( str instanceof Date){
        return str;
    } else if( str.includes( "now" ) || str.includes( "departure" )){
        let isPlus = str.includes("+");
        let splitPos = (isPlus ?  str.indexOf('+') : str.indexOf('-'));
        let amount = str.substring( splitPos +1, str.length-1 );
        let timeStep = str.substring( str.length-1 );
        switch(timeStep){
            case 's': multiple=1;break;
            case 'm': multiple=60;break;
            case 'h': multiple=3600;break;
            default: {
                multiple=1;
                log_error( 'Invalid string passed into date_from_string function expected "[now|departure][+|-]{int}[s|m|h]" got: "' + str + '"' );
            }
        }
        seconds = (amount * multiple)
        seconds *= isPlus ? 1 : -1;
        return seconds;
    }else{
        return str
    }
}

function is_week_day( now ){
    let day = now.getDay();
    return day > 0 && day < 6;
}

function set_date_and_time() {
    let now = new Date();
    let monthAsString = now.toLocaleString('default', { month: 'short' })   //TODO - CAN I DO THIS LOCAL STRING BETTER

    let date = now.getDate() + ' ' + monthAsString + '. ' + now.getFullYear();
    let time = get_padded_time_seconds( now );
    let local_time_zone = (now.isDstObserved() ? ' (British Summer Time)' : 'GMT');

    $("#date").html( date );
    $("#local-time").html( time );
    $("#local-time-zone").html( local_time_zone );
}

function update_timezones_ui( model, now ){
    if( model.config.showTimeZones ){
        let timeZones = model.runtimeConfig.timeZones.zones;
        if( !model.data.timeZones.insertedTimeElements ){
            let timeZoneElements = ''
            for( var i = 0; i < timeZones.length && i < 4; i++ ){
                timeZoneElements +=
                '<div class="row">'
                    + '<span id="time-zone-'+ i +'-flag" class="col-2 h3">'+ timeZones[i].flag +'</span>'
                    + '<span id="time-zone-'+ i +'-name" class="col-4 h3">'+ timeZones[i].name +'</span>'
                    + '<span id="time-zone-'+ i +'-time" class="col-4 h3">'+ convert_to_time_zone(now, timeZones[i].id ) +'</span>'
                + '</div>'
            }
            $("#time-zones").html( timeZoneElements );
            model.data.timeZones.insertedTimeElements = true;
        }

        for( var i = 0; i < timeZones.length && i < 4; i++ ){
            $("#time-zone-"+ i +"-time").html( convert_to_time_zone(now, timeZones[i].id ));
        }
        $(".time-zone-element").removeClass("d-none");
    }else{
        $(".time-zone-element").addClass("d-none");
    }
}

function convert_to_time_zone(date, tzString) {
    return new Date((typeof date === "string" ? new Date(date) : date)).toLocaleString("en-GB", {timeZone: tzString }).split( ", ")[1].substring(0,5);
}