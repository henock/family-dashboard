
function update_model_with_calendar_events( model, date ){
    if( model.config.showCalendar && model.data.calendar.nextDownloadDataTime < date ){
         download_calendar( model );
         model.data.calendar.nextDownloadDataTime = date_plus_seconds( date, model.runtimeConfig.calendar.updateEvery );
         model.data.calendar.lastUpdatedTime = clock.get_Date();
    }
}

function update_calendar_ui( model, now ){
    if( model.config.showCalendar && model.data.calendar && model.data.calendar.dataDownloaded ){
        eventsHtml = build_calendar_events_for_ui( model.data.calendar);
        $('#calendar-events').html( eventsHtml );
        $(".calendar-element").removeClass( "d-none");
    }else{
        $(".calendar-element").addClass( "d-none");
    }
}

function redact_text( private, text ){
    if(private){
        return `${text.substring(0,4)} **** REDACTED **** ${text.substr(-2)}`;
    }else{
        return text;
    }
}

function build_calendar_events_for_ui( calendar ){
    let eventsHtml =  `<div><table class="calendar-event border-bottom">`;
    let eventCounter = 0;
    let shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
    let previousDay = '';
    for (event of calendar.events) {
        let startDate = new Date(event.startDate);
        let startTime = event.startTime.substring(0, 5 );
        let endTime = event.endTime.substring(0, 5 );
        let shortDay = shortDays[startDate.getDay()];
        let dayNumber = startDate.getDate();
        let privateEvent = event.description.startsWith("P:");
        let description = redact_text( privateEvent, event.description);
        description = replace_funny_quotes( description );
        let location = '';
        let shortDate = get_date_with_dashes(startDate);
        let sameDayAsPrevious = (shortDate == previousDay);
        previousDay = shortDate;
        if( "missing value" !== event.location ){
            location = '(' + redact_text( privateEvent, event.location.substring(0,15)) + '...)'
        }
        eventsHtml +=  `<tr class="border-top ${sameDayAsPrevious?'border-dark':''} pb-2">
                            <td>
                                <div class="row short-day${sameDayAsPrevious?'-dark':''}">${shortDay}</div>
                                <div class="row day-number${sameDayAsPrevious?'-dark':''}">${dayNumber}</div>
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

    let fileUpdatedAtDate = new Date(calendar.fileUpdatedAt)
    let fileUpdatedAt = get_date_with_dashes(fileUpdatedAtDate) + ' at ' + get_padded_time_minutes(fileUpdatedAtDate)

    eventsHtml += `</table></div><div class="pt-2 pl-2">Last calendar update: ${fileUpdatedAt}</div>`;
    return eventsHtml;
}

function download_calendar( model ){
    let urlToGet = model.config.urls.familyICalendarUrl;

    try {
        model.data.calendar = get_remote_data(urlToGet);
        let result = model.data.calendar.events.sort(sort_on_event_dates);
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