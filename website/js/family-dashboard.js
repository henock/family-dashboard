var globalModel;

$(document).ready(function () {
    if(running_unit_tests()){
        run_all_unit_tests();
    } else {
        setInterval(update_dashboard, 100 );
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
            return setup_model( true, false );
        }else{
            return setup_model( false, true );
        }
    }else{
        globalModel.isDefaultModel = false;
        return globalModel;
    }
}

function update_model( model ){
    check_for_new_code( model, reload_dashboard, new Date() );
    update_model_with_tasks( model, new Date() );
    update_model_with_trains( model, new Date() );
    update_model_with_weather( model, new Date() );
}

function check_for_new_code( model, reload_page_function, date ){
    if( model.data.reloadDashboardCheck.nextDownloadDataTime < date ){
         download_last_code_update_file( model );
         if( model.data.reloadDashboardCheck.lastCodeUpdate < date ){
            reload_page_function();
         }else{
            model.data.reloadDashboardCheck.nextDownloadDataTime = now_plus_seconds( model.runtimeConfig.reloadDashboardCheck.updateEvery );
         }
    }
}

function reload_dashboard(){
    location.reload(true); // reloads the whole dashboard
}

function download_last_code_update_file( model ){
    let urlToGet = 'data/last-code-update.json';
    let callAsync = model.config.callAsync;
    if(model.config.debugging){
        urlToGet = 'test-data/last-code-update.json';
    }

    get_remote_data( urlToGet, callAsync, model, function( model2, data ){
        model2.data.reloadDashboardCheck.lastCodeUpdate = date_from_string( data.lastCodeUpdate );
    }, function( model2, xhr, default_process_error){
        log_error( "Unable to retrieve last-code-update.json from: '" + urlToGet + "'.")
        default_process_error( xhr );
    });
}


function update_UI( model ){
    $("#dashboard-main").removeClass("d-none");
    let now = new Date();
    update_date_and_time_ui( model, now );
    update_timezones_ui( model, now );
    update_tasks_ui( model, now );
    update_trains_ui( model, now );
    update_weather_ui( model, now );
    update_school_run_ui( model, now );
    remove_overdue_messages();
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
    let urlToGet = "data/api-keys.json";
    let callAsync = model.config.callAsync;
    if(model.config.debugging){
        urlToGet = "test-data/debug-api-keys.json";
    }

    get_remote_data( urlToGet, callAsync, model, function( model2, data ){
        model2.apiKeys = data;
    }, function( model2, xhr, default_process_error){
        log_error( "Unable to retrieve API keys from: '" + urlToGet + "' - switching off all functionality that requires remote calls.")
        model2.config.showTasks = false;
        model2.config.showWeather =  false;
        model2.config.showTravel =  false;
        model2.config.showTimeZones =  false;
        default_process_error( xhr );
    });
}

function update_model_with_station_to_code_maps( model ){
    if( !model.stationCodeToNameMap ){  //only need it once.
        let urlToGet = "data/station-codes.json";
        get_remote_data( urlToGet, false, model
        , function( model2, data ){
            let entries = Object.entries(data);
            let entry;
            let nameToCode = new Map();
            let codeToName = new Map();

            for (var i = 0; i < entries.length; i++ ){
                entry = entries[i];
                nameToCode.set( entry[0], entry[1] );
                codeToName.set( entry[1], entry[0] );
            };
            model2.stationCodeToNameMap = codeToName;
            model2.stationNameToCodeMap = nameToCode;
        }, function( model2, xhr, default_process_error){
            model2.config.showTravel =  false;
            default_process_error( xhr );
        });
    }
}

function update_model_with_runtime_config( model ){
    function success_function( model2, data ){
        model2.runtimeConfig = data;
        model2.config.showTasks = data.tasks.show
        model2.config.showTravel = data.trains.show
        model2.config.showWeather = data.weather.show
        model2.config.showTimeZones = data.timeZones.show
        model2.config.showSchoolRunCountDown = data.schoolRunCountDown.show
        sanitise_dates_for_commute_config( model2.runtimeConfig.transport.commute, new Date() );
    }

    function error_function( model2, xhr, default_process_error ){
        model2.config.showTasks = false;
        model2.config.showWeather =  false;
        model2.config.showTimeZones =  false;
        model2.config.showTravel =  false;
        model2.config.showSchoolRunCountDown =  false;
        default_process_error( xhr );
    }

    let urlToGet = "data/runtime-config.json";
    let callAsync = model.config.callAsync;
    if(model.config.debugging){
        urlToGet = "test-data/debug-runtime-config.json";
    }

    get_remote_data(urlToGet, callAsync, model, success_function, error_function );
}

function setup_model( debugging, callAsync ){
    model = create_empty_model( debugging, callAsync );
    update_model_with_api_keys( model );
    update_model_with_runtime_config( model );
    download_last_code_update_file( model );
    update_model_with_station_to_code_maps( model );
    return model;
}

function create_empty_model( debugging, callAsync ){
    let inThePast = now_plus_seconds( -10 );
    let nextReloadDashboardCheck = now_plus_seconds( 300 );
    return {
        isDefaultModel: true,
        config : {
            debugging: debugging,
            callAsync: callAsync,
            showTimeZones: false,
            showSchoolRunCountDown: false,
            showWeather: false,
            showTravel: false,
            showTasks: false
        },
        apiKeys : {},
        runtimeConfig : {},
        data : {
            reloadDashboardCheck : {
                nextDownloadDataTime: nextReloadDashboardCheck
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
    }
}

function sanitise_dates_for_commute_config( commutes , date ){
    date = date ? date : new Date();
    commutes.forEach(function( commute ){
        commute.noNeedToLeaveBefore = seconds_from_string( commute.noNeedToLeaveBefore );
        commute.minimumWalkTransitTime = seconds_from_string( commute.minimumWalkTransitTime );
        commute.minimumRunTransitTime = seconds_from_string( commute.minimumRunTransitTime );
        if( commute.minimumDriveTransitTime ){
            commute.minimumDriveTransitTime = seconds_from_string( commute.minimumDriveTransitTime );
        }
    });
}

function get_remote_data( urlToGet, runAsync, model, success_response_parser_function, fail_response_parser_function ){

    function default_process_error( xhr ){
        if( xhr ){
            log_error( xhr.status +': Error calling ' + urlToGet + ', got the response  ('+xhr.responseText +').');
        } else{
            log_error( ' Error calling ' + urlToGet + ' ( Unknown error ).');
        }
    }

    $.ajax({
        url: urlToGet,
        type: "GET",
        async: runAsync,
        success: function( data ) {
            return success_response_parser_function( model, data );
        },
        error: function ( xhr ){
            if( fail_response_parser_function ) {
                fail_response_parser_function( model , xhr , default_process_error);
            }else{
                default_process_error( xhr );
            }
        }
    });
}
