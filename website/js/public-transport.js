
function colour_eta_warnings( secondsUntilArrival , arrivalString, walk_time_seconds, run_time_seconds ){
    if( secondsUntilArrival < run_time_seconds ){
        return '<span class="time-to-run">' + arrivalString + '</span>';
    } else if( secondsUntilArrival < walk_time_seconds ){
        return '<span class="time-to-walk">' + arrivalString + '</span>';
    } else {
        return arrivalString;
    }
}
