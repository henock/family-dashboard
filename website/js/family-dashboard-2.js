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

//$(document).ready(function () {
//    if(running_unit_tests()){
//        run_all_unit_tests();
//    } else {
//        setInterval(update_dashboard, 100 );
//    }
//});

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
        update_model_with_commutes( model );
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

    let result = get_remote_data( urlToGet, false, model, function( model2, data ){
        model2.apiKeys = data;
    });

    return model;
}

function update_model_with_station_to_code_maps( model ){
    let urlToGet = "data/station-codes.json";
    let result = get_remote_data( urlToGet, false, model, function( model2, data ){
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
    });

    return model;
}

function update_model_with_runtime_config( model ){
    if(model.config.debugging){
        let urlToGet = "test-data/debug-runtime-config.json";
        let result = get_remote_data( urlToGet, false, model, function( model2, data ){
            model2.runtimeConfig = data;
        });
    }else{
        let urlToGet = "data/runtime-config.json";
        get_remote_data( urlToGet, false, model, function( model2, data ){
            model2.runtimeConfig = data;
        });
    }
    return model;
}

function setup_model( debugging, model, overWrite ){
    if( overWrite || !model ){
        model = create_empty_model( debugging );
        update_model_with_api_keys( model );
        update_model_with_runtime_config( model );
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
            commutes : {
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

function get_remote_data( urlToGet, runAsync, model, response_parser_function ){
    $.ajax({
        url: urlToGet,
        type: "GET",
        async: runAsync,
        success: function( data ) {
            return response_parser_function( model, data );
        },
        error: function ( xhr ){
            if( xhr ){
                log_error( xhr.status +': Error calling ' + urlToGet + ', got the response  ('+xhr.responseText +').');
            } else{
                log_error( ' Error calling ' + urlToGet + ' ( Unknown error ).');
            }
        }
    });
}