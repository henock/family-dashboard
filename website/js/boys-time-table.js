
function update_model_with_boys_time_table( model, date ){
    if( model.config.showBoysTimeTable ){
        if(!model.data.boysTimeTable){
            download_boys_time_table( model );
        }
    }
    //TODO - CONSIDER IN A DIFFERENT _UPDATE_UI METHOD
    update_boys_time_table_ui( model, date );
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
    if( model.config.showBoysTimeTable && model.data.boysTimeTable ){
        boysTimeTableHtml = build_boys_time_table_for_ui( model.data.boysTimeTable );
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

function build_boys_time_table_for_ui(boysTimeTable){
    const weekday = ["Monday","Tuesday","Wednesday","Thursday","Friday"];

    let weekType = work_out_which_week_we_are_in();
    let weekToShow = (weekType == "A" ? 0:1);
    let dayToShow = time_table_day_to_show();
    let MelkamsClasses = boysTimeTable.Melkam.weeks[weekToShow].days[dayToShow].classes;
    let SennaisClasses = boysTimeTable.Sennai.weeks[0].days[dayToShow].classes;
    let MelkamsClassesHtml = build_html_for_classes( MelkamsClasses );
    let SennaisClassesHtml = build_html_for_classes( SennaisClasses );

    return `<div class="row">
                <div class="row col-12 pl-4 border-bottom"><h3>${weekday[dayToShow]}</h3></div>
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

function time_table_day_to_show( now ){
    if( now === undefined ){
        now = clock.get_Date();
    }
    let dayToShow = 0;
    if(is_week_day( now )){
        dayToShow = now.getDay()-1;  //Time table starts on Monday not Sunday
    }
    return dayToShow;
}

function work_out_which_week_we_are_in( now ){
    if( now === undefined ){
      now = clock.get_Date();
    }
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
    for(let i = 0; i < classes.length;i++){
        aClass = classes[i];
        html+=`<div class="row ml-1 class-name${aClass.recreation?'-play-time':''}
                    ${aClass.name.replaceAll(' ', '-')} ">${aClass.name}</div>`;
    }
    return html;
}
