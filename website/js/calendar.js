
 function download_calendar( model ){
    let urlToGet = model.config.urls.familyICalendarUrl;

    try {
        model.data.calendar = get_remote_data(urlToGet);
        let result = model.data.calendar.events.sort(sort_on_event_dates)
        model.data.calendar.dataDownloaded = true;
    } catch (e) {
        log_error( "Unable to retrieve calendar from: '" + urlToGet +
                    "' I got back: '" + e.statusText +"'");
    }
}


function sort_on_event_dates( a, b ){
    let aDate = new Date(a.startDate);
    let bDate = new Date(b.startDate);
    if (aDate < bDate) {
            return -1;
    } else if (aDate > bDate) {
        return 1;
    }
    // a must be equal to b
    return 0;
}