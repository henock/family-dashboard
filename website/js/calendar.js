
function update_model_with_calendar_events( model, date ){
    if( model.config.showCalendar && model.data.calendar.nextDownloadDataTime < date ){
         download_calendar( model );
         model.data.calendar.nextDownloadDataTime = date_plus_seconds( date, model.runtimeConfig.calendar.updateEvery );
         model.data.calendar.lastUpdatedTime = clock.get_Date();
    }
}

function update_calendar_ui( model, now ){
    if( model.config.showCalendar && model.data.calendar && model.data.calendar.dataDownloaded ){
        eventsHtml = build_calendar_events_for_ui( model.data.calendar.events);
        $('#calendar-events').html( eventsHtml );
        $(".calendar-element").removeClass( "d-none");
    }else{
        $(".calendar-element").addClass( "d-none");
    }
}


function build_calendar_events_for_ui( events ){
    let eventsHtml =  '<table class="calendar-event">';
    let eventCounter = 0;
    let shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
    for (event of events) {
        let startDate = new Date(event.startDate);
        let startTime = event.startTime.substring(0, 5 );
        let endTime = event.endTime.substring(0, 5 );
        let shortDay = shortDays[startDate.getDay()];
        let dayNumber = startDate.getDate();
        let description = event.description;
        let location = "missing value" !== event.location ? '('+ event.location.substring(0,15) + '...)': '';
        eventsHtml +=  `<tr class="border-bottom pb-2">
                            <td>
                                <div class="row short-day">${shortDay}</div>
                                <div class="row day-number">${dayNumber}</div>
                            </td>
                            <td>
                                <div class="col pl-4">
                                    <div class="row"><span class="span6 start-time">${startTime}</span>-<span class="pl-2 end-time">${endTime}</span></div>
                                    <div class="row"><span class="span6 description">${description}</span><span class="location">${location}</span></div>
                                </div>
                            </td>
                        </tr>
                       `;
        eventCounter++;
    }
    eventsHtml += '</table>';
    return eventsHtml;
}

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