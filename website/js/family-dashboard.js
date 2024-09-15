var globalModel;

$(document).ready(function () {
    if(running_unit_tests()){
        run_all_unit_tests();
    } else {
        setInterval(update_dashboard, 1000 );
    }
});

function update_dashboard() {
    globalModel =  get_global_model();
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
    update_urls_if_debugging( model )
    download_last_code_update_file( model );
    update_model_with_api_keys( model );
    update_model_with_station_to_code_maps( model );
    return model;
}

function update_model( model ){
    update_model_with_tasks( model, clock.get_Date() );
    update_model_with_trains( model, clock.get_Date() );
    update_model_with_weather( model, clock.get_Date() );
    reload_the_dashboard( model, clock.get_Date() );
}

function reload_the_dashboard( model, date ) {
    if( !model.data.nextDashboardReload  ) {
        model.data.nextDashboardReload = now_plus_seconds( model.runtimeConfig.reloadDashboardEvery );
        return false;
    } else if( model.data.nextDashboardReload < date ) {
        return true;
        model.data.nextDashboardReload = now_plus_seconds( model.runtimeConfig.reloadDashboardEvery );
        location.reload(true); // reloads the whole dashboard
    }else{
        return false;
    }
}

function download_last_code_update_file( model ){
    let urlToGet = model.config.urls.lastCodeUpdate;
    try{
        let data =  get_remote_data( urlToGet );
        model.data.lastCodeUpdate = date_from_string( data.lastCodeUpdate );
        model.data.nextDashboardReload = date_from_string( model.runtimeConfig.reloadDashboardEvery );
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
    update_trains_ui( model, now );
    update_weather_ui( model, now );
    update_school_run_ui( model, now );
    remove_overdue_messages();
    changeBackgroundColors( model.runtimeConfig.backgroundColor );
}

function update_date_and_time_ui( model, now ){
    let monthAsString = now.toLocaleString('default', { month: 'short' })   //TODO - Can I do this better?

    let date = now.getDate() + ' ' + monthAsString + '. ' + now.getFullYear();
    let time = get_padded_time_seconds( now );
    let local_time_zone = (now.isDstObserved() ? ' (British Summer Time)' : 'GMT');

    $("#date").html( date );
    $("#local-time").html( time );
    $("#local-time-zone").html( local_time_zone );
}

function update_model_with_api_keys( model ){
    let urlToGet = model.config.urls.apiKeys;
    try{
        let data =  get_remote_data( urlToGet );
        model.apiKeys = data;
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

            for (var i = 0; i < entries.length; i++ ){
                entry = entries[i];
                nameToCode.set( entry[0], entry[1] );
                codeToName.set( entry[1], entry[0] );
            };
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
    let urlToGet = model.config.debugging ?  "data-for-running-locally/debug-runtime-config.json"
                                          :  "data/runtime-config.json";
    try {
        let data =  get_remote_data( urlToGet );
        model.runtimeConfig = data;
        model.config.showTasks = data.tasks.show
        model.config.showTravel = data.trains.show
        model.config.showWeather = data.weather.show
        model.config.showTimeZones = data.timeZones.show
        model.config.showSchoolRunCountDown = data.schoolRunCountDown.show
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
    let urls = {}

    if(model.config.debugging){
        urls.runtimeConfig  = 'data-for-running-locally/debug-runtime-config.json';
        urls.lastCodeUpdate = 'data-for-running-locally/last-code-update.json';
        urls.familyCalendar = 'data-for-running-locally/family-calendar.ics';
        urls.apiKeys        = 'data-for-running-locally/debug-secrets.json';
    }else{
        urls.runtimeConfig  = 'data/runtime-config.json';
        urls.lastCodeUpdate = 'data/last-code-update.json';
        urls.familyCalendar = model.runtimeConfig.familyICalendarUrl;
        urls.apiKeys        = 'data/secrets.json';
    }
    model.config.urls = urls;
}

function create_empty_model( debugging ){
    let inThePast = now_plus_seconds( -10 );
    return {
        isDefaultModel: true,
        config : {
            debugging: debugging,
            showTimeZones: false,
            showSchoolRunCountDown: false,
            showWeather: false,
            showTravel: false,
            showTasks: false
        },
        apiKeys : {},
        data : {
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
    }
}

function sanitise_dates_for_commute_config( commutes , date ){
    date = date ? date : clock.get_Date();
    commutes.forEach(function( commute ){
        commute.noNeedToLeaveBefore = seconds_from_string( commute.noNeedToLeaveBefore );
        commute.minimumWalkTransitTime = seconds_from_string( commute.minimumWalkTransitTime );
        commute.minimumRunTransitTime = seconds_from_string( commute.minimumRunTransitTime );
        if( commute.minimumDriveTransitTime ){
            commute.minimumDriveTransitTime = seconds_from_string( commute.minimumDriveTransitTime );
        }
    });
}