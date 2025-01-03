
function update_model_with_boys_time_table( model, date ){
    if( model.config.boysTimeTable.show ){
        if(!model.data.boysTimeTable){
            download_boys_time_table( model );
        }
    }
}

function download_boys_time_table( model ){
    let urlToGet = model.config.urls.boysTimeTable;

    try {
        model.data.boysTimeTable = get_remote_data(urlToGet);
    } catch (e) {
        log_error( "Unable to retrieve the boys time table from: '" + urlToGet +
                    "' I got back: '" + e.statusText +"'");
    }
}

function update_boys_time_table_ui( model, now ){
    if( model.config.boysTimeTable.show && model.data.boysTimeTable ){
        boysTimeTableHtml = build_boys_time_table_for_ui( model.data.boysTimeTable,
                                                          model.config.boysTimeTable.showNextDayAfterHour );
        $("#boys-time-table").html( boysTimeTableHtml );
        $(".boys-time-table-element").removeClass( "d-none");
        $("#all-travel").addClass( "col-9");
        $("#boys-time-table").addClass( "col-3");
    }else{
        $(".boys-time-table-element").addClass( "d-none");
        $("#all-travel").removeClass( "col-9");
        $("#all-travel").addClass( "col-12");
    }
}



function build_boys_time_table_for_ui( boysTimeTable, showNextDayAfterHour ){
    let weekType = work_out_which_week_we_are_in();
    let weekToShow = (weekType == "A" ? 0:1);
    let showFollowingSchoolDay = clock.get_Date().getHours() >= showNextDayAfterHour;
    let dayToShow = time_table_day_to_show(clock.get_Date().getDay(), showFollowingSchoolDay);
    let nextDayHint = dayToShow == 1 ? " (next week)" : " (tomorrow)";
    dayToShowString = weekday[dayToShow] + (showFollowingSchoolDay ? nextDayHint : "");

    let MelkamsClasses = boysTimeTable.Melkam.weeks[weekToShow].days[dayToShow].classes;
    let SennaisClasses = boysTimeTable.Sennai.weeks[0].days[dayToShow].classes;
    let MelkamsClassesHtml = build_html_for_classes( MelkamsClasses );
    let SennaisClassesHtml = build_html_for_classes( SennaisClasses );

    return `<div class="row">
                <div class="row col-12 pl-4 border-bottom"><h3>${dayToShowString}</h3></div>
                <div id="Melkam" class="col">
                    <h3 class="text-success">Melkam</h3>
                    <div class="row pl-3 pb-2 mb-2 border-bottom text-success">Week ${weekType}</div>
                    ${MelkamsClassesHtml}
                </div>
                <div id="Sennai" class="col border-left">
                    <h3 class="text-danger">Sennai</h3>
                    <div class="row pl-2 pb-2 mb-2 border-bottom text-black">Week ${weekType}</div>
                    ${SennaisClassesHtml}
                </div>
           </div>
           `;
}

function time_table_day_to_show( dayToShow, showFollowingSchoolDay ){
    const SUNDAY = 0;
    const FRIDAY = 5;
    const MONDAY = 1;
    if(showFollowingSchoolDay){
        dayToShow += 1; //show next day after school hours
    }
    return dayToShow == SUNDAY || dayToShow > FRIDAY ? MONDAY: dayToShow;
}

function work_out_which_week_we_are_in( now ){
    now = (now ? now : clock.get_Date());
    let weekNumber = get_week_number(now);
    if(is_week_day( now )){
        return (weekNumber % 2 == 0 ? "A": "B");
    }else{
        //Becomes the other week (as on Sat/Sun we want to show
        //The details for the following Monday
        return (weekNumber % 2 == 1 ? "A": "B");
    }
}

function build_html_for_classes( classes ){
    let html = "";
    let aClass = null;
    classes.forEach(function(aClass){
        html+=`<div class="row ml-1 class-name${aClass.recreation?'-play-time':''}
                    ${aClass.name.replaceAll(' ', '-')} ">${aClass.name}</div>`;
    });
    return html;
}
