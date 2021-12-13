
function update_model_with_trains( model ){
    if( model.data.trains.nextUpdateTime < new Date() ){
        set_trains( model );
        model.data.trains.nextUpdateTime = now_plus_seconds( model.runtimeConfig.trains.updateEvery );
    }
    return model;
}

function set_trains( model ){
    let startingStations = model.runtimeConfig.transport.commute;
    for( i = 0; i < startingStations.length; i++ ){
        get_train_station_departures( startingStations[i], model );
    }
}

function get_train_station_departures( commute, model ){
    let urlToGet = "";
    let startingStationCode =  model.stationNameToCodeMap.get( commute.from );
    if(model.config.debugging){
        urlToGet = "test-data/transportapi-" + startingStationCode +".json"
    } else{
        let now = new Date();
        let fullDate = date_with_dashes( now );
        let fullTime = get_padded_time_minutes( now );
        let transportApi = model.apiKeys.transportApi

        urlToGet = "http://transportapi.com/v3/uk/train/station/"
                        + startingStationCode +"/"
                        + fullDate + "/"
                        + fullTime  + "/timetable.json?app_id="
                        + transportApi.appId + "&app_key="
                        + transportApi.appKey
    }
    get_remote_data( urlToGet, false, model
    , function( model2, data ){
        let trains = [];
        let showingTrainsCount = 0;
        let maximumTrainsToShow = model.runtimeConfig.transport.maximumTrainsToShow;
        $(data.departures.all)
            .each(function(index,it){
                if( showingTrainsCount < maximumTrainsToShow &&
                    ( commute.showAllDestinations ||  commute.to.includes( it.destination_name ))){
                    showingTrainsCount++;
                    trains.push(extract_trains_details( it , model.stationNameToCodeMap));
                }
            });

        let commuteData = {
            code: startingStationCode,
            name: commute.from,
            departures: trains
        }

        model2.data.trains.startingStations.push( commuteData );
    }, function( model2, xhr, default_process_error ){
        model2.config.showTasks = false;
        model2.config.showWeather =  false;
        model2.config.showTravel =  false;
        model2.config.showSchoolRunCountdown =  false;
        default_process_error( xhr );
    });
    return model;
}

function extract_trains_details( trainDetails, stationNameToCodeMap, currentTime ){
    currentTime = currentTime ? currentTime : new Date();
    let departureTimeString = trainDetails.expected_departure_time ? trainDetails.expected_departure_time : trainDetails.aimed_departure_time;
    let departureTime = calculate_departure_date_time_from_time_only( departureTimeString, currentTime );
    let destination  = stationNameToCodeMap.get( trainDetails.destination_name );
    if( !destination ){ destination = "XXX"; }
    return {
        "departureTime" : departureTime,
        "platform": trainDetails.platform,
        "destination":  destination,
        "status" : trainDetails.status
    };
}

function calculate_departure_date_time_from_time_only( departureTimeAsString, currentTime ){
    let departureTime = date_from_string( departureTimeAsString, currentTime );
    if((currentTime.getHours()-2) > departureTime.getHours() ){
        return new Date( departureTime.getTime() + (TWENTY_FOUR_HOURS * 1000) );
    }else{
        return departureTime;
    }
}
