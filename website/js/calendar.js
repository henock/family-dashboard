
 function download_calendar( model ){
    try {
        let data =  $.get( model.config.urls.familyCalendar );
        model.data.calendar.full = data;
//        model.data.calendar.today = get_events_for_day( 0 );
//        model.data.calendar.tomorrow = get_events_for_day( 1 )
        model.data.calendar.dataDownloaded = true;
    } catch (e) {
        log_error( "Unable to retrieve calendar from: '" + urlToGet +
                    "' I got back: '" + e.statusText +"'");
    }
}

function parse_calendar_file( iCalendarData, date ){
    var jcalData = ICAL.parse(iCalendarData);
    var vcalendar = new ICAL.Component(jcalData);
    var vevent = vcalendar.getFirstSubcomponent('vevent');
    var summary = vevent.getFirstPropertyValue('transp');
    return summary;
}