var globalModel;

$(document).ready(function () {
    if( false ){
        old_document_ready();
    }else{
        if(running_unit_tests()){
            run_all_unit_tests();
        } else {
            setInterval(update_dashboard, 100 );
        }
    }
});

function update_dashboard() {
    if( !globalModel ){
        if(is_debug_on()){
            globalModel = setup_model( true );
            log_error( "Test error removed in 10 seconds...", 10 );
            write_html_message( "<span class='text-success'>Test</span><span class='text-warning'> html</span><span class='text-danger'> error</span> removed in 5 seconds...</b>", 5 );
        }else{
            globalModel = setup_model( false );
        }
    }else{
        globalModel.isDefaultModel = false;
    }
    update_model( globalModel );
    update_UI( globalModel );
}

function update_model( model ){
    update_model_with_tasks( model, new Date() );
    update_model_with_trains( model, new Date() );
    update_model_with_weather( model, new Date() );
}

function update_UI( model ){
    $("#dashboard-main").removeClass("d-none");
    let now = new Date();
    update_date_and_time_ui( model, now );
    update_timezones_ui( model, now );
    update_tasks_ui( model, now );
    update_trains_ui( model, now );
    update_weather_ui( model, now );
    remove_overdue_messages();
}

function update_date_and_time_ui( model, now ){
    let monthAsString = now.toLocaleString('default', { month: 'short' })   //TODO - DO THIS LOCAL THING BETTER

    let date = now.getDate() + ' ' + monthAsString + '. ' + now.getFullYear();
    let time = get_padded_time_seconds( now );
    let local_time_zone = (now.isDstObserved() ? ' (British Summer Time)' : 'GMT');

    $("#date").html( date );
    $("#local-time").html( time );
    $("#local-time-zone").html( local_time_zone );
}

function update_model_with_api_keys( model ){
    let urlToGet = "data/api-keys.json";
    if(model.config.debugging){
        urlToGet = "test-data/debug-api-keys.json";
    }

    get_remote_data( urlToGet, false, model, function( model2, data ){
        model2.apiKeys = data;
    }, function( model2, xhr, default_process_error){
        log_error( "Unable to retrieve API keys from: '" + urlToGet + "' - switching off all functionality that requires remote calls.")
        model2.config.showTasks = false;
        model2.config.showWeather =  false;
        model2.config.showTravel =  false;
        model2.config.showTimeZones =  false;
        default_process_error( xhr );
    });

    return model;
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
    return model;
}

function update_model_with_runtime_config( model ){
    function success_function( model2, data ){
        model2.runtimeConfig = data;
        model2.config.showTasks = data.tasks.show
        model2.config.showTravel = data.trains.show
        model2.config.showWeather = data.weather.show
        model2.config.showTimeZones = data.timeZones.show
        model2.config.showSchoolRunCountDown = data.schoolRunCountDown.show
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
    if(model.config.debugging){
        urlToGet = "test-data/debug-runtime-config.json";
    }

    get_remote_data(urlToGet, false, model, success_function, error_function );
    return model;
}

function setup_model( debugging ){
    model = create_empty_model( debugging );
    update_model_with_api_keys( model );
    update_model_with_runtime_config( model );
    sanitise_dates( model );
    update_model_with_station_to_code_maps( model );
    return model;
}

function create_empty_model( debugging ){
    let inThePast = now_plus_seconds( -10 );
    return {
        isDefaultModel: true,
        config : {
            debugging: debugging,
            showTimeZones: true,
            showSchoolRunCountDown: true,
            showWeather: true,
            showTravel: true,
            showTasks: true
        },
        apiKeys : {},
        runtimeConfig : {},
        data : {
            tasks : {
                nextDownloadDataTime: inThePast,
                nextRebuildUiTime: inThePast
            },
            timeZones :{
                insertedTimeElements: false
            },
            trains : {
                nextDownloadDataTime: inThePast,
                nextRebuildUiTime: inThePast,
                startingStations: []
            },
            weather :{
                nextDownloadDataTime: inThePast,
                nextRebuildUiTime: inThePast,
                today: {},
                futureDays: []
            }
        }
    }
}

function sanitise_dates( model, date ){
    date = date ? date : new Date();
    sanitise_dates_for_school_run( model, date );
    sanitise_dates_for_commute_config( model, date );
    sanitise_dates_for_train_times( model, date);
}

function sanitise_dates_for_train_times( model, date ){
    date = date ? date : new Date();
    model.data.trains.startingStations.forEach(function(station){
        station.departures.forEach(function(departure){
            departure.departureTime = date_from_string( departure.departureTime );
        });
    });
    return model;
}

function sanitise_dates_for_commute_config( model , date ){
    date = date ? date : new Date();
    model.runtimeConfig.transport.commute.forEach(function( commute ){
        commute.noNeedToLeaveBefore = seconds_from_string( commute.noNeedToLeaveBefore );
        commute.walkTransitTime = seconds_from_string( commute.walkTransitTime );
        commute.runTransitTime = seconds_from_string( commute.runTransitTime );
        commute.driveTransitTime = seconds_from_string( commute.driveTransitTime );
    });
    return model;
}

function sanitise_dates_for_school_run( model , date ){
    date = date ? date : new Date();
    let schoolRun = model.runtimeConfig.schoolRunCountDown;
    schoolRun.showCountDownStart = date_from_string( schoolRun.showCountDownStart );
    schoolRun.startCountDown = date_from_string( schoolRun.startCountDown );
    schoolRun.getOutOfBedBy = date_from_string( schoolRun.getOutOfBedBy );
    schoolRun.finishGettingDressedBy = date_from_string( schoolRun.finishGettingDressedBy );
    schoolRun.finishBreakfastBy = date_from_string( schoolRun.finishBreakfastBy );
    schoolRun.putOnShoesBy = date_from_string( schoolRun.putOnShoesBy );
    schoolRun.departureTime = date_from_string( schoolRun.departureTime );
    schoolRun.stopCountDown = date_from_string( schoolRun.stopCountDown );
    schoolRun.showCountDownStop = date_from_string( schoolRun.showCountDownStop );
    return model;
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
                process_error( xhr );
            }
        }
    });
}
