var model;

//TODO STARTS HERE
//test model returned has not changed as its an interface
// test model retuned from each url call
//            getData(){
//              internalModel ={}
//              iM.keys = getKeys()
//             if( !keys ){
//                iM.keysNotFound = true
//                // update what I can without keys
//                return;
//              else {
//                 iM.trains = getTrains()
//                 ..
//              }
//            }
//
//            updateUI( model ) {
//                updateTasks()
//                updateTransit()
//                updateWeather()
//            }
//
//            updateTransit( model ){
//               updatePublicTransport()
//               updateSchoolRun()
//            }
//
//            updatePublicTransport( model ){
//               for( train : model.trains ){
//                 //keep all logic here not in html
//                 if( train departed ){
//                    remove train
//                 } else {
//                     if( !html.trainId present ) {
//                          insert html for train
//                     }
//                      updateTrainHtml( train )
//                 }
//            }
//TODO ENDS HERE

$(document).ready(function () {
    if( true ){
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
    model = setup_model(is_debug_on(), model);
    update_model( model );
//    updateUI( model );
}

function update_model( model ){
    if( model.config.showTasks ){
        update_model_with_tasks( model );
    }
    if( model.config.showTravel ){
        update_model_with_trains( model );
    }
    if( model.config.showWeather ){
        update_model_with_weather( model );
    }
}

function update_model_with_api_keys( model ){
    let urlToGet = "data/api-keys.json";

    if(model.config.debugging){
        urlToGet = "test-data/debug-api-keys.json";
    }

    get_remote_data( urlToGet, false, model
    , function( model2, data ){
        model2.apiKeys = data;
    }, function( model2, xhr, default_process_error){
        log_error( "Unable to retrieve API keys from: '" + urlToGet + "' - switching off all functionality that requires remote calls.")
        model2.config.showTasks = false;
        model2.config.showWeather =  false;
        model2.config.showTravel =  false;
        default_process_error( xhr );
    });

    return model;
}

function update_model_with_station_to_code_maps( model ){
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

    return model;
}

function update_model_with_runtime_config( model ){
    let urlToGet = "data/runtime-config.json";

    if(model.config.debugging){
        urlToGet = "test-data/debug-runtime-config.json";
    }

    get_remote_data( urlToGet, false, model
    , function( model2, data ){
        model2.runtimeConfig = data;
    }, function( model2, xhr, default_process_error ){
        model2.config.showTasks = false;
        model2.config.showWeather =  false;
        model2.config.showTravel =  false;
        model2.config.showSchoolRunCountdown =  false;
        default_process_error( xhr );
    });

    return model;
}

function setup_model( debugging, model, overWrite ){
    if( overWrite || !model ){
        model = create_empty_model( debugging );
        update_model_with_api_keys( model );
        update_model_with_runtime_config( model );
        sanitise_dates( model );
        update_model_with_station_to_code_maps( model );
    }else{
        model.isDefaultModel = false;
    }
    return model;
}

function create_empty_model( debugging ){
    let inThePast = now_plus_seconds( -10 );
    return {
        isDefaultModel: true,
        config : {
            debugging: debugging,
            showTimeZones: false,
            showSchoolRunCountdown: false,
            showWeather: false,
            showTravel: false,
            showTasks: false
        },
        apiKeys : {},
        runtimeConfig : {},
        data : {
            tasks : {
                nextUpdateTime: inThePast
            },
            trains : {
                nextUpdateTime: inThePast,
                startingStations: []
            },
            weather :{
                nextUpdateTime: inThePast,
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

    function process_error( xhr ){
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
                fail_response_parser_function( model , xhr , process_error);
            }else{
                process_error( xhr );
            }
        }
    });
}
