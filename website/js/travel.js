const TOO_EARLY = "tooEarly";
const PLENTY_OF_TIME = "plentyOfTime";
const MOVE_QUICKER_TIME = "moveQuickerTime";
const ALMOST_OUT_OF_TIME = "almostOutOfTime";
const OUT_OF_TIME = "outOfTime";

const SCHOOL_RUN = "schoolRun";
const PUBLIC_TRANSPORT = "publicTransport";


function set_train_arrivals( intervalInSeconds ){
    if( familyDashboard.config.travel ){

        let model = {};
        model.commutes = familyDashboard.runtimeConfig.transport.commutes;
        model.maximumTrainsToShow = familyDashboard.runtimeConfig.transport.maximumTrainsToShow;
        model.transportApi = familyDashboard.runtimeConfig.transportApi
        model.stationCodeToNameMap = familyDashboard.runtimeConfig.transport.stationCodeToNameMap;
        model.stationNameToCodeMap = familyDashboard.runtimeConfig.transport.stationNameToCodeMap;

        for( i = 0; i < model.commutes.length; i++ ){
            set_train_station_arrivals( model.commutes[i], model, familyDashboard.runtimeConfig.transportApi );
        }

        $('#train-travel').html("");
        update_train_UI( model );
        set_refresh_values( "#train-travel-update", intervalInSeconds );
    }
}


function set_train_station_arrivals( commute, model, transportApi ){
    let startingStationCode =  model.stationNameToCodeMap.get( commute.from );
    let fullDate = date_with_dashes();
    let fullTime = get_padded_time_minutes();
    let urtToGet = '';
    let runAsync = false;
    commute.trains = [];

    if( is_debug_on()){
        urlToGet = "test-data/transportapi-" + startingStationCode +".json"
    } else{
        urlToGet = "http://transportapi.com/v3/uk/train/station/"
                        + startingStationCode +"/"
                        + fullDate + "/"
                        + fullTime  + "/timetable.json?app_id="
                        + transportApi.appId + "&app_key="
                        + transportApi.appKey
    }

    $.ajax({
        url: urlToGet,
        type: "GET",
        async: runAsync,
        success: function( data ) {
            var showingTrainsCount = 0;
            $(data.departures.all)
                .each(function(index,it){
                    if( showingTrainsCount < model.maximumTrainsToShow &&
                        ( commute.showAllDestinations ||
                          is_destination_station( commute, it.destination_name, model.stationNameToCodeMap))){
                        showingTrainsCount++;
                        commute.trains.push(extract_trains_details( it , model.stationNameToCodeMap));
                    }
                });
        },
        error: function ( xhr ){
            if( xhr ){
                log_error( xhr.status +' Error calling transportapi.com for '
                            + startingStationCode +' timetable (' +xhr.responseText +').');
            }else{
                log_error( ' Error calling transportapi.com for ' + startingStationName +' timetable ( Unknown error ).');
            }
        }
    });
}

function is_destination_station( commute, stationName, stationNameToCodeMap ){
    let stationCode = stationNameToCodeMap.get( stationName );
    return commute.to.includes(stationCode);
}

function extract_trains_details( trainDetails , stationNameToCodeMap, currentTime ){
    currentTime = currentTime ? currentTime : new Date();
    let departureTimeString = trainDetails.expected_departure_time ? trainDetails.expected_departure_time : trainDetails.aimed_departure_time;
    let departureTime = calculate_departure_date_time_from_time_only( departureTimeString, currentTime );
    let destination  = stationNameToCodeMap.get( trainDetails.destination_name );

    return {
        "departureTime" : departureTime,
        "platform": trainDetails.platform,
        "destination":  destination,
        "status" : trainDetails.status
    };
}

function is_week_day( now ){
    let day = now.getDay();
    return day > 0 && day < 6;
}

function calculate_departure_date_time_from_time_only( departureTimeAsString, currentTime ){
    let departureTime = date_from_string( departureTimeAsString, currentTime );
    if((currentTime.getHours()-2) > departureTime.getHours() ){
        return new Date( departureTime.getTime() + (TWENTY_FOUR_HOURS * 1000) );
    }else{
        return departureTime;
    }
}

function update_train_UI( model ){

    for( i = 0; i < model.commutes.length; i++ ){
        commute = model.commutes[i];
        startingStationCode = model.stationNameToCodeMap.get( commute.from );
        let border = '';
        if( i === 0 ){
            border = 'border-top';
        }else{
            border = 'border-top border-left';
        }

        $('#train-travel').append( "<div class='col "+ border +" align-top'><div id='"+ startingStationCode +"' class='pt-2'></div></div>");

        let station_element_id = "#" + startingStationCode

        $(station_element_id).html(
            '<div class="row">'
            +'  <div class="col h5 text-center">'+ TRAIN_GLYPH + commute.from + '</div>'
            + '</div>'
        );

        for( j = 0; j < commute.trains.length; j++ ){
            let now = new Date();
            let train_details = commute.trains[j];
            if( now < train_details.departureTime ){
                platform = train_details.platform == null ? '': '['+ train_details.platform + '] ';
                let transportId =  startingStationCode + '-' + train_details.destination + '-' + j;
                destination_with_color = colour_special_fields( train_details.destination, commute.to.join("|") );

                let timeBoundaries = build_time_boundaries( commute.noNeedToLeaveBefore, commute.walkTransitTime,
                                                            commute.runTransitTime, commute.driveTransitTime,
                                                            train_details.departureTime);
                let trainRow =
                     '  <div class="row text-monospace text-nowrap">'
                    +'      <div class="col-1">'+platform+'</div>'
                    +'      <div class="col-2">' + destination_with_color + '</div>'
                    +'      <div class="col-8 transport-departure-time p-0" '
                    +'   	    transport-id="' + transportId + '"'
                    +'	        display-name="' + train_details.destination + '"'
                    +'	        tooEarly="' + commute.noNeedToLeaveBefore + '"'
                    +'	        plentyOfTime="' + commute.walkTransitTime + '"'
                    +'	        moveQuickerTime="' + commute.runTransitTime + '"'
                    +'	        almostOutOfTime="' + commute.driveTransitTime + '"'
                    +'	        transportType="' + PUBLIC_TRANSPORT + '"'
                    +'   	    deadLine="' + train_details.departureTime + '"'
                    +' 	        index="' + j + '">'
                    +           build_transport_eta_countdown_element( timeBoundaries, transportId, PUBLIC_TRANSPORT );
                    +'      </div>'
                    +'</div>';

                $(station_element_id).append( trainRow );
            }
        }
    }
}

function build_school_run_countdown_element( timeBoundaries  ){
    let boundaryWindow = get_boundary_window( timeBoundaries , SCHOOL_RUN );
    let classForBoundaryWindow = get_class_for_boundary_window( boundaryWindow );
    let countDownTime = display_time_period_from_seconds_into_future(get_seconds_until( timeBoundaries.deadLine));
    let paddedTimeMinutes = get_padded_time_minutes(timeBoundaries.deadLine);

    let div =
         ' <div class="col text-'+ classForBoundaryWindow +'">🏫'+ countDownTime + ' ' + boundaryWindow.emoji +' </div>'
        +'   <div class="col align-middle">'
        +'       <div class="progress" style="height: 105px;">'
        +'           <div class="progress-bar bg-'+ classForBoundaryWindow +'" role="progressbar" aria-valuenow="75"'
        +'                                              aria-valuemin="0" aria-valuemax="100" style="width: '+
                                                        boundaryWindow.progressBarPercentage +'%"></div>'
        +'       </div>'
        +'   </div>'
        +' <div class="col text-'+ classForBoundaryWindow +'">'+ paddedTimeMinutes +'</div>'
    return div;
}


function build_transport_eta_countdown_element( timeBoundaries, transportId, transportType ){
    let boundaryWindow = get_boundary_window( timeBoundaries, transportType );
    let classForBoundaryWindow = get_class_for_boundary_window( boundaryWindow );
    let countDownTime = display_time_period_from_seconds_into_future(get_seconds_until( timeBoundaries.deadLine));
    let paddedTimeMinutes = get_padded_time_minutes(timeBoundaries.deadLine);
    let div =
         '          <div class="row">'
        +'              <div class="col-3 text-'+ classForBoundaryWindow +'">'+ countDownTime +'</div>'
        +'              <div class="col-2"></div>'
        +'              <div class="col-2 text-'+ classForBoundaryWindow +'">'+ paddedTimeMinutes +' ' + boundaryWindow.emoji + '</div>'
        +'          </div>'
    if( boundaryWindow.name !== TOO_EARLY && boundaryWindow.name !== OUT_OF_TIME ){
        div +='     <div class="row">'
        +'              <div class="col-10">'
        +'                  <div class="progress" style="height: 15px;">'
        +'                      <div id="'+ transportId +'" class="progress-bar bg-'+ classForBoundaryWindow +'" role="progressbar"'
        +'                                              aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: '+
                                                        boundaryWindow.progressBarPercentage +'%"></div>'
        +'                  </div>'
        +'              </div>'
        +'              <div class="col-2>'
        +'          </div>'
    }

    return div;
}

function get_class_for_boundary_window( boundaryWindow ){
    switch( boundaryWindow.name){
        case TOO_EARLY: return 'primary';
        case PLENTY_OF_TIME: return 'success';
        case MOVE_QUICKER_TIME: return 'warning';
        case ALMOST_OUT_OF_TIME: return 'danger';
        case OUT_OF_TIME: return 'secondary';
        default: return '';
    }
}

function show_or_hide_school_run_departure_time(){
    if( familyDashboard.config.showSchoolRunCountdown ){
        let schoolRunCountDown = familyDashboard.runtimeConfig.schoolRunCountDown;
        let schoolRunElement = $("#school-run");
        let departTimeElement = $("#school-run-departure-time");
        let now = new Date();

        if( schoolRunElement.hasClass('d-none')) {
            let showCountdownStart = date_from_string( schoolRunCountDown.showCountDownStart, new Date());
            let showCountdownStop = date_from_string( schoolRunCountDown.showCountDownStop , new Date());
            let weekday = is_week_day( now );
            let inside_school_run_window =  showCountdownStart < now && now < showCountdownStop;
             if( is_debug_on() || (weekday && inside_school_run_window )){
                let secondsUntilDeparture = get_seconds_until( date_from_string(schoolRunCountDown.departureTime ));
                let secondsUntilDepartureString = display_time_period_from_seconds_into_future( secondsUntilDeparture );
                let timeBoundaries = build_time_boundaries_for_school_run( schoolRunCountDown );
                departTimeElement.attr('transport-id' ,  'schoolRun' );
                departTimeElement.attr('showCountdownStart' ,  showCountdownStart );
                departTimeElement.attr('showCountdownStop' ,  showCountdownStop );
                departTimeElement.attr('tooEarly' ,  timeBoundaries.tooEarly );
                departTimeElement.attr('plentyOfTime' ,  timeBoundaries.plentyOfTime );
                departTimeElement.attr('moveQuickerTime' ,  timeBoundaries.moveQuickerTime );
                departTimeElement.attr('almostOutOfTime' ,  timeBoundaries.almostOutOfTime );
                departTimeElement.attr('deadLine' ,  timeBoundaries.deadLine );
                departTimeElement.attr('transportType', SCHOOL_RUN);
                departTimeElement.html( build_school_run_countdown_element( timeBoundaries ));
                schoolRunElement.removeClass('d-none');
                departTimeElement.addClass('transport-departure-time');
            }
        } else if( now > new Date( departTimeElement.attr( 'showCountdownStop' )) ){
            schoolRunElement.addClass('d-none');
        }
    }
}

function build_time_boundaries_for_school_run( schoolRunCountDown ){
    let timeBoundaries = {}
    timeBoundaries.tooEarly = get_seconds_until( date_from_string( schoolRunCountDown.getOutOfBedBy));
    timeBoundaries.plentyOfTime = get_seconds_until( date_from_string( schoolRunCountDown.finishGettingDressedBy ));
    timeBoundaries.moveQuickerTime = get_seconds_until( date_from_string( schoolRunCountDown.finishBreakfastBy ));
    timeBoundaries.almostOutOfTime = get_seconds_until( date_from_string( schoolRunCountDown.putOnShoesBy ));
    timeBoundaries.deadLine =  date_from_string(schoolRunCountDown.departureTime );
    return timeBoundaries;
}

function get_boundary_window( timeBoundaries, transportType, secondsUntilTargetTime ){
    if( !secondsUntilTargetTime && secondsUntilTargetTime !== 0 ){
        secondsUntilTargetTime = get_seconds_until( timeBoundaries.deadLine);
    }
    let boundaryWindow = {};
     if ( secondsUntilTargetTime > timeBoundaries.tooEarly ) {
        boundaryWindow.top = secondsUntilTargetTime;
        boundaryWindow.bottom =  timeBoundaries.tooEarly;
        boundaryWindow.name = TOO_EARLY;
        boundaryWindow.emoji =  (transportType == SCHOOL_RUN ?  "🛌" :  "");
    } else if( secondsUntilTargetTime > timeBoundaries.plentyOfTime ) {
        boundaryWindow.top = timeBoundaries.tooEarly;
        boundaryWindow.bottom =  timeBoundaries.plentyOfTime;
        boundaryWindow.name = PLENTY_OF_TIME;
        boundaryWindow.emoji =  (transportType == SCHOOL_RUN ? " 👔️" : "🚶");
    } else if( secondsUntilTargetTime > timeBoundaries.moveQuickerTime ) {
        boundaryWindow.top = timeBoundaries.plentyOfTime;
        boundaryWindow.bottom =  timeBoundaries.moveQuickerTime;
        boundaryWindow.name = MOVE_QUICKER_TIME;
        boundaryWindow.emoji =  (transportType == SCHOOL_RUN ? " 🥣" : "🏃");
    } else if( secondsUntilTargetTime > timeBoundaries.almostOutOfTime ) {
        boundaryWindow.top = timeBoundaries.moveQuickerTime;
        boundaryWindow.bottom =  timeBoundaries.almostOutOfTime;
        boundaryWindow.name = ALMOST_OUT_OF_TIME;
        boundaryWindow.emoji =  (transportType == SCHOOL_RUN ? " 👞" : " 🚗");
    } else {
        boundaryWindow.top = timeBoundaries.almostOutOfTime;
        boundaryWindow.bottom = 0;
        boundaryWindow.name = OUT_OF_TIME;
        boundaryWindow.emoji =  (transportType == SCHOOL_RUN ? "" :  "");
    }

    let nominator = (secondsUntilTargetTime - boundaryWindow.bottom  );
    let deNominator = ( boundaryWindow.top - boundaryWindow.bottom );
    if( nominator === deNominator || secondsUntilTargetTime < 0 ){
        boundaryWindow.progressBarPercentage = 0;
    } else {
        boundaryWindow.progressBarPercentage = 100 - Math.floor((nominator / deNominator) * 100);
    }

    return boundaryWindow;
}