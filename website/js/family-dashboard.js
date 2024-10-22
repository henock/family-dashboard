var globalModel;

$(document).ready(function () {
    if(running_unit_tests()){
        run_all_unit_tests();
    } else {
        setInterval(update_dashboard, 1000 );
    }
});

function update_dashboard() {
    globalModel = get_global_model();
    update_model( globalModel );
    update_UI( globalModel );
}

function get_global_model(){
    if( !globalModel ){
        if(is_debug_on()){
            log_error( "Test error removed in 10 seconds after: " + get_padded_time_seconds(now_plus_seconds(10)), 10 );
            write_html_message( "<span class='text-success'>Test</span><span class='text-warning'> html</span><span class='text-danger'> error</span> removed in 5 seconds after: "+ get_padded_time_seconds(now_plus_seconds(5))+"</b>", 5 );
            debug_using_different_time();
            return setup_model_for_debugging();
        }else{
            return setup_model_for_production();
        }
    }else{
        globalModel.isDefaultModel = false;
        return globalModel;
    }
}

function setup_model_for_debugging(){
     return setup_model(true);
}

function setup_model_for_production(){
     return setup_model(false);
}

function setup_model( debugging ){
    model = create_empty_model( debugging );
    update_model_with_runtime_config( model );
    update_urls_if_debugging( model );
    download_last_code_update_file( model );
    update_model_with_secrets( model );
    update_model_with_station_to_code_maps( model );
    update_model_with_boys_time_table( model, clock.get_Date() );
    return model;
}

function update_model( model ){
    update_model_with_tasks( model, clock.get_Date() );
    update_model_with_calendar_events( model, clock.get_Date() );
    update_model_with_trains( model, clock.get_Date() );
    update_model_with_weather( model, clock.get_Date() );
    reload_the_dashboard( model, clock.get_Date(), function(){location.reload(true);});
}

function reload_the_dashboard( model, date, reload_dashboard_function ) {
    if( !model.data.nextDashboardReload  ) {
        model.data.nextDashboardReload = now_plus_seconds( model.runtimeConfig.reloadDashboardEvery );
        return false;
    } else if( model.data.nextDashboardReload < date ) {
        reload_dashboard_function(); // reloads the whole dashboard
        return true;
    }else{
        return false;
    }
}

function download_last_code_update_file( model ){
    let urlToGet = model.config.urls.lastCodeUpdate;
    try{
        let data =  get_remote_data( urlToGet );
        model.data.lastCodeUpdate = date_from_string( data.lastCodeUpdate );
        model.data.nextDashboardReload = now_plus_seconds( model.runtimeConfig.reloadDashboardEvery );
    }catch( e ){
        log_error( "Unable to retrieve last code update from: '" + urlToGet +
                    "' I got back: '" + e.statusText +"'");
    }
}

function update_UI( model ){
    $("#dashboard-main").removeClass("d-none");
    let now = clock.get_Date();
    //TODO - ONLY PASS IN THE RELEVANT PART OF THE MODEL!! UPDATE TESTING TO REFLECT THIS.
    update_date_and_time_ui( model, now );
    update_timezones_ui( model, now );
    update_tasks_ui( model, now );
    update_boys_time_table_ui( model, now );
    update_calendar_ui( model, now );
    update_trains_ui( model, now );
    update_weather_ui( model, now );
    update_school_run_ui( model, now );
    update_boys_time_table_ui( model, now );
    remove_overdue_messages();
    changeBackgroundColors( model );
}

function update_date_and_time_ui( model, now ){
    let monthAsString = now.toLocaleString("default", { month: "short" });   //TODO - Can I do this better?

    let date = now.getDate() + " " + monthAsString + ". " + now.getFullYear();
    let time = get_padded_time_seconds( now );
    let local_time_zone = (now.isDstObserved() ? " (British Summer Time)" : "GMT");

    $("#date").html( date );
    $("#local-time").html( time );
    $("#local-time-zone").html( local_time_zone );
}

function update_model_with_secrets( model ){
    let urlToGet = model.config.urls.secrets;
    try{
        let data =  get_remote_data( urlToGet );
        model.secrets = data;
    }catch( e ){
        log_error( "Unable to retrieve API keys from: '" + urlToGet +
                    "' I got back: '" + e.statusText +
                    "' - switching off all functionality that requires remote calls.");
        model.config.showTasks = false;
        model.config.showWeather =  false;
        model.config.showTravel =  false;
        model.config.showTimeZones =  false;
    }
}

function update_model_with_station_to_code_maps( model ){
    if( !model.stationCodeToNameMap ){  //only need it once.
        let urlToGet = "data/station-codes.json";
        try {
            let data =  get_remote_data( urlToGet );
            let entries = Object.entries(data);
            let entry;
            let nameToCode = new Map();
            let codeToName = new Map();

            entries.forEach( (entry) =>{
                nameToCode.set( entry[0], entry[1] );
                codeToName.set( entry[1], entry[0] );
            });

            model.stationCodeToNameMap = codeToName;
            model.stationNameToCodeMap = nameToCode;
        }catch( e ){
            log_error( "Unable to retrieve station to code maps from: '" + urlToGet +
                        "' I got back: '" + e.statusText +"'");
            model.config.showTravel =  false;
        }
    }
}

function update_model_with_runtime_config( model ){
    let urlToGet = (model.config.debugging ?  "data-for-testing/debug-runtime-config.json"
                                          :  "data/runtime-config.json");
    try {
        let data =  get_remote_data( urlToGet );
        model.runtimeConfig = data;
        model.config.showTasks = data.tasks.show;
        model.config.showTravel = data.trains.show;
        model.config.showWeather = data.weather.show;
        model.config.showCalendar = data.calendar.show;
        model.config.showTimeZones = data.timeZones.show;
        model.config.boysTimeTable = data.boysTimeTable;
        model.config.showSchoolRunCountDown = data.schoolRunCountDown.show;
        sanitise_dates_for_commute_config( model.runtimeConfig.transport.commute, clock.get_Date() );
    }catch( e ) {
        log_error( "Unable to retrieve runtime config from: '" + urlToGet +
                    "' I got back: '" + e.statusText +"' - switching off all remote calls");
        model.config.showTasks = false;
        model.config.showWeather =  false;
        model.config.showTimeZones =  false;
        model.config.showTravel =  false;
        model.config.showSchoolRunCountDown =  false;
    }
}

function update_urls_if_debugging( model ) {
    let urls = {};

    if(model.config.debugging){
        urls.runtimeConfig       = "data-for-testing/debug-runtime-config.json";
        urls.lastCodeUpdate      = "data-for-testing/last-code-update.json";
        urls.secrets             = "data-for-testing/debug-secrets.json";
        urls.familyICalendarUrl  = "data-for-testing/family-calendar.json";
        urls.boysTimeTable       = "data/boys-time-table.json";
    }else{
        urls.runtimeConfig       = "data/runtime-config.json";
        urls.lastCodeUpdate      = "data/last-code-update.json";
        urls.secrets             = "data/secrets.json";
        urls.familyICalendarUrl  = "data/family-calendar.json";
        urls.boysTimeTable       = "data/boys-time-table.json";
    }
    model.config.urls = urls;
}

function create_empty_model( debugging ){
    let inThePast = now_plus_seconds( -10 );
    return {
        isDefaultModel: true,
        config : {
            showTasks: false,
            showTravel: false,
            showWeather: false,
            showTimeZones: false,
            boysTimeTable: false,
            debugging: debugging,
            showSchoolRunCountDown: false
        },
        secrets : {},
        data : {
            calendar : {
                dataDownloaded: false,
                nextDownloadDataTime: inThePast,
                nextRebuildUiTime: inThePast
            },
            tasks : {
                dataDownloaded: false,
                nextDownloadDataTime: inThePast,
                nextRebuildUiTime: inThePast
            },
            schoolRunCountDown :{
            },
            timeZones :{
                dataDownloaded: false,
                insertedTimeElements: false
            },
            trains : {
                dataDownloaded: 0,
                nextDownloadDataTime: inThePast,
                nextRebuildUiTime: inThePast,
                startingStations: []
            },
            weather :{
                todaysDataDownloaded: false,
                futureDataDownloaded: false,
                nextDownloadDataTime: inThePast,
                nextRebuildUiTime: inThePast,
                today: {},
                futureDays: []
            }
        }
    };
}

function sanitise_dates_for_commute_config( commutes , date ){
    date = (date ? date : clock.get_Date());
    commutes.forEach(function( commute ){
        commute.noNeedToLeaveBefore = seconds_from_string( commute.noNeedToLeaveBefore );
        commute.minimumWalkTransitTime = seconds_from_string( commute.minimumWalkTransitTime );
        commute.minimumRunTransitTime = seconds_from_string( commute.minimumRunTransitTime );
        if( commute.minimumDriveTransitTime ){
            commute.minimumDriveTransitTime = seconds_from_string( commute.minimumDriveTransitTime );
        }
    });
}