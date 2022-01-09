const TOO_EARLY = "tooEarly";
const PLENTY_OF_TIME = "plentyOfTime";
const MOVE_QUICKER_TIME = "moveQuickerTime";
const ALMOST_OUT_OF_TIME = "almostOutOfTime";
const OUT_OF_TIME = "outOfTime";



function update_model_with_trains( model , date ){
    if( model.config.showTravel && model.data.trains.nextDownloadDataTime < date ){
        set_trains( model );
        model.data.trains.nextDownloadDataTime = now_plus_seconds( model.runtimeConfig.trains.updateEvery );
        model.data.trains.lastUpdatedTime = new Date();
    }
}

function update_trains_ui( model, now ){
    if( model.config.showTravel && model.data.trains.dataDownloaded > 0 ){
        if( model.data.trains.nextRebuildUiTime < now ){
            insert_all_trains( model );
            if( model.data.trains.dataDownloaded >= model.runtimeConfig.transport.commute.length ){
                model.data.trains.nextRebuildUiTime = now_plus_seconds( model.runtimeConfig.trains.updateEvery );
            }
        }
        update_all_train_count_downs( model );
        let countDown = generate_next_download_count_down_values( model.data.trains.nextDownloadDataTime, model.runtimeConfig.trains.updateEvery );
        set_next_download_count_down_elements( "train-travel-update", countDown );
        $(".travel-element").removeClass("d-none");
    }else{
        $(".travel-element").addClass("d-none");
        write_to_console( 'trains.dataDownloaded=' + model.data.trains.dataDownloaded );
    }
}

function update_all_train_count_downs( model ){
    let now = new Date();
    model.data.trains.startingStations.forEach( function(startingStation){
        startingStation.departures.forEach(function(train, index){
            let transportId =  build_transport_id( startingStation, train, index);
            if( now < train.departureTime ){
                let trainHtml = build_transport_eta_countdown_element( train, transportId );
                $( '#' + transportId + "-eta").html( trainHtml );
            }else{
                $( '#' + transportId ).addClass( 'd-none' );
            }
        });
    });
}

function insert_all_trains( model ){
    let isFirst = true;
    $('#train-travel').html('');
    model.data.trains.startingStations.forEach( function(startingStation ){
        let border = '';
        if( isFirst ){
            border = 'border-top';
            isFirst = false;
        }else{
            border = 'border-top border-left';
        }

        $('#train-travel').append( "<div class='col "+ border +" align-top'><div id='"+ startingStation.code +"' class='pt-2'></div></div>");
        let stationElementId = "#" + startingStation.code
        $(stationElementId).html(
            '<div class="row">'
            +'  <div class="col h5 text-center">'+ TRAIN_GLYPH + startingStation.name + '</div>'
            +'</div>'
        );
        let now = new Date();
        startingStation.departures.forEach(function(train, index){
            if( now < train.departureTime ){
                $(stationElementId).append( build_train_row( train, startingStation, index ));
            }
        });
    });
}

function build_transport_id( startingStation, train, index ){
    return startingStation.code + '-' + train.destinationStationCode + '-' + index;;
}

function build_train_row( train, startingStation, index){
    platform = train.platform == null ? '': '['+ train.platform + '] ';
    let transportId =  build_transport_id( startingStation, train, index) ;
    let destinationStationCodeSpan = highlightCommuteToDestinations( train.destinationStationCode, train.isCommuteToDestination );
    let trainRow =   '<div id="' + transportId + '" class="row text-monospace text-nowrap">'
                    +' <div class="col-1">'+platform+'</div>'
                    +' <div class="col-2">' + destinationStationCodeSpan + '</div>'
                    +' <div id="' + transportId + '-eta" class="col-8 p-0"></div>'
                    +'</div>';
    return trainRow;
}

function build_transport_eta_countdown_element( train, transportId, date ){
    date = date ? date : new Date();
    let boundaryWindow = get_boundary_window_for_public_transport( train, date );
    let classForBoundaryWindow = get_class_for_boundary_window( boundaryWindow );
    let countDownTime = display_time_period_from_seconds_into_future(get_seconds_until( train.departureTime));
    let paddedTimeMinutes = get_padded_time_minutes(train.departureTime);
    if( train.departureTime > date ){
        let div ='          <div class="row">'
                +'              <div class="col-3 text-'+ classForBoundaryWindow +'">'+ countDownTime +'</div>'
                +'              <div class="col-2"></div>'
                +'              <div class="col-2 text-'+ classForBoundaryWindow +'">'+ paddedTimeMinutes +' ' + boundaryWindow.emoji + '</div>'
                +'          </div>'
            if( boundaryWindow.name !== TOO_EARLY && boundaryWindow.name !== OUT_OF_TIME ){
                div +='     <div class="row">'
                +'              <div class="col-10">'
                +'                  <div class="progress" style="height: 15px;">'
                +'                      <div id="'+ transportId +'-progress-bar" class="progress-bar bg-'+ classForBoundaryWindow +'" role="progressbar"'
                +'                                              aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: '+
                                                                boundaryWindow.progressBarPercentage +'%"></div>'
                +'                  </div>'
                +'              </div>'
                +'              <div class="col-2>'
                +'          </div>'
            }
        return div;
    }else {
        $("#" + transportId ).addClass("d-none");
        return "";
    }
}

function get_boundary_window_for_public_transport( transport, date ){
    date = date ? date : new Date();
    let currentTimeStamp = date.getTime();
    let boundaryWindow = {};
    if ( currentTimeStamp < transport.noNeedToLeaveBeforeTimeStamp ) {
        boundaryWindow.start = currentTimeStamp;
        boundaryWindow.end =  transport.noNeedToLeaveBeforeTimeStamp;
        boundaryWindow.name = TOO_EARLY;
        boundaryWindow.emoji =  "";
    } else if( currentTimeStamp < transport.minimumWalkTransitTimeStamp ) {
        boundaryWindow.start = transport.noNeedToLeaveBeforeTimeStamp;
        boundaryWindow.end =  transport.minimumWalkTransitTimeStamp;
        boundaryWindow.name = PLENTY_OF_TIME;
        boundaryWindow.emoji =  "🚶";
    } else if( currentTimeStamp < transport.minimumRunTransitTimeStamp ) {
        boundaryWindow.start = transport.minimumWalkTransitTimeStamp;
        boundaryWindow.end =  transport.minimumRunTransitTimeStamp;
        boundaryWindow.name = MOVE_QUICKER_TIME;
        boundaryWindow.emoji =  "🏃";
    } else if(  transport.minimumDriveTransitTimeStamp && currentTimeStamp < transport.minimumDriveTransitTimeStamp ) {
        boundaryWindow.start = transport.minimumRunTransitTimeStamp;
        boundaryWindow.end =  transport.minimumDriveTransitTimeStamp;
        boundaryWindow.name = ALMOST_OUT_OF_TIME;
        boundaryWindow.emoji =  " 🚙";
    } else {
        if( transport.minimumDriveTransitTimeStamp ){
            boundaryWindow.start = transport.minimumDriveTransitTimeStamp;
        }else{
            boundaryWindow.start = transport.minimumRunTransitTimeStamp;
        }
        boundaryWindow.end = transport.departureTimeStamp;
        boundaryWindow.name = OUT_OF_TIME;
        boundaryWindow.emoji = "";
    }

    boundaryWindow.progressBarPercentage = calculate_progress_bar_percentage(   boundaryWindow.start, boundaryWindow.end, currentTimeStamp );
    return boundaryWindow;
}

function highlightCommuteToDestinations( destinationStationCode, isCommuteToDestination ){
    if( isCommuteToDestination ){
        return '<span class="text-success">' + destinationStationCode + '</span>';;
    }else{
        return destinationStationCode;
    }
}

function set_trains( model ){
    let startingStations = model.runtimeConfig.transport.commute;
    model.data.trains.startingStations = [];  //clear previous data
    for( i = 0; i < startingStations.length; i++ ){
        get_train_station_departures( startingStations[i], model );
    }
}

function get_train_station_departures( commute, model ){
    let urlToGet = "";
    let callAsync = model.config.callAsync;
    let startingStationCode =  model.stationNameToCodeMap.get( commute.from );
    if(model.config.debugging){
        urlToGet = "test-data/transportapi-" + startingStationCode +".json";
    } else{
        let now = new Date();
        let fullDate = get_date_with_dashes( now );
        let fullTime = get_padded_time_minutes( now );
        let transportApi = model.apiKeys.transportApi

        urlToGet = "http://transportapi.com/v3/uk/train/station/"
                        + startingStationCode +"/"
                        + fullDate + "/"
                        + fullTime  + "/timetable.json?app_id="
                        + transportApi.appId + "&app_key="
                        + transportApi.appKey;
    }
    get_remote_data( urlToGet, callAsync, model
    , function( model2, data ){
        let trains = [];
        let showingTrainsCount = 0;
        let maximumTrainsToShow = model.runtimeConfig.transport.maximumTrainsToShow;
        $(data.departures.all)
            .each(function(index,it){
                let isCommuteToDestination = commute.to.includes( it.destination_name );
                if( showingTrainsCount < maximumTrainsToShow &&
                    ( commute.showAllDestinations || isCommuteToDestination)){
                    showingTrainsCount++;
                    trains.push(extract_trains_details( commute, it, isCommuteToDestination, model.stationNameToCodeMap));
                }
            });

        let commuteData = {
            code                : startingStationCode,
            name                : commute.from,
            departures          : trains
        }

        sanitise_dates_for_train_times( commuteData.departures );
        model2.data.trains.startingStations.push( commuteData );
        model2.data.trains.dataDownloaded += 1;
        write_to_console( 'model2.data.trains.dataDownloaded=' +  model2.data.trains.dataDownloaded );
    }, function( model2, xhr, default_process_error ){
        default_process_error( xhr );
    });
}

function sanitise_dates_for_train_times( departures ){
    date = date ? date : new Date();
    departures.forEach(function(train){
        train.departureTime = date_from_string( train.departureTime );
    });
}


function extract_trains_details( commute, trainDetails, isCommuteToDestination, stationNameToCodeMap, currentTime ){
    currentTime = currentTime ? currentTime : new Date();
    let departureTimeString = trainDetails.expected_departure_time ? trainDetails.expected_departure_time : trainDetails.aimed_departure_time;
    let departureTime = calculate_departure_date_time_from_time_only( departureTimeString, currentTime );
    let destinationStationCode  = stationNameToCodeMap.get( trainDetails.destination_name );
    if( !destinationStationCode ){ destinationStationCode = "XXX"; }
    let result =  {
        "departureTime" : departureTime,
        "departureTimeStamp" : departureTime.getTime(),
        "platform": trainDetails.platform,
        "destinationStationCode":  destinationStationCode,
        "status" : trainDetails.status,
        "isCommuteToDestination": isCommuteToDestination,
        "noNeedToLeaveBeforeTimeStamp":  date_plus_seconds( departureTime, commute.noNeedToLeaveBefore ).getTime(),
        "minimumWalkTransitTimeStamp":  date_plus_seconds( departureTime, commute.minimumWalkTransitTime ).getTime(),
        "minimumRunTransitTimeStamp":  date_plus_seconds( departureTime, commute.minimumRunTransitTime ).getTime(),
    };
    if( commute.minimumDriveTransitTime ){
        result.minimumDriveTransitTimeStamp = date_plus_seconds( departureTime, commute.minimumDriveTransitTime ).getTime()

    }
    return result;
}

function calculate_departure_date_time_from_time_only( departureTimeAsString, currentTime ){
    let departureTime = date_from_string( departureTimeAsString, currentTime );
    if((currentTime.getHours()-2) > departureTime.getHours() ){
        return new Date( departureTime.getTime() + (TWENTY_FOUR_HOURS * 1000) );
    }else{
        return departureTime;
    }
}