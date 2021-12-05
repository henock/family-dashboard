const TOO_EARLY = "tooEarly";
const PLENTY_OF_TIME = "plentyOfTime";
const MOVE_QUICKER_TIME = "moveQuickerTime";
const ALMOST_OUT_OF_TIME = "almostOutOfTime";
const OUT_OF_TIME = "outOfTime";


function set_train_arrivals( intervalInSeconds ){
    if( familyDashboard.config.travel ){
        let stationCodeToNameMap = familyDashboard.runtimeConfig.transport.stationCodeToNameMap;

        let model = {};
        model.commutes = familyDashboard.runtimeConfig.transport.commutes;
        model.maximumTrainsToShow = familyDashboard.runtimeConfig.transport.maximumTrainsToShow;
        model.transportApi = familyDashboard.runtimeConfig.transportApi
        model.stationCodeToNameMap = new Map(Object.entries(stationCodeToNameMap));

        for( i = 0; i < model.commutes.length; i++ ){
            set_train_station_arrivals( model.commutes[i], model, familyDashboard.runtimeConfig.transportApi );
        }

        $('#train-travel').html("");
        update_train_UI( model );
        set_refresh_values( "#train-travel-update", intervalInSeconds );
    }
}


function set_train_station_arrivals( commute, model, transportApi ){
    let startingStationName =  model.stationCodeToNameMap.get( commute.from );
    let fullDate = date_with_dashes();
    let fullTime = get_padded_time_minutes();
    let urtToGet = '';
    let runAsync = false;
    commute.trains = [];

    if( is_debug_on()){
        urlToGet = "test-data/transportapi-" + commute.from +".json"
    } else{
        urlToGet = "http://transportapi.com/v3/uk/train/station/"
                        + commute.from +"/"
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
                          is_destination_station( commute, it.destination_name, model.stationCodeToNameMap))){
                        showingTrainsCount++;
                        commute.trains.push(extract_trains_details( it , model.stationCodeToNameMap));
                    }
                });
        },
        error: function ( xhr ){
            if( xhr ){
                log_error( xhr.status +' Error calling transportapi.com for '
                            + startingStationName +' timetable (' +xhr.responseText +').');
            }else{
                log_error( ' Error calling transportapi.com for ' + startingStationName +' timetable ( Unknown error ).');
            }
        }
    });
}

function is_destination_station( commute, stationName, stationCodeToNameMap ){
    let stationCode = get_station_code_from_name( stationName, stationCodeToNameMap );
    return commute.to.includes(stationCode);
}

function extract_trains_details( it , stationCodeToNameMap ){
    let platform = it.platform ;
    let departureTime = calculate_departure_date_time_from_time_only( it.aimed_departure_time, new Date() );
    let destination = get_station_code_from_name( it.destination_name, stationCodeToNameMap );

    return {
        "departureTime" : departureTime,
        "platform": platform,
        "destination":  destination
    };
}

function is_week_day( now ){
    let day = now.getDay();
    return day > 0 && day < 6;
}

function get_station_code_from_name( station_name, stationCodeToNameMap ){
    let entries = stationCodeToNameMap.entries();
    let entry = entries.next();
    while( entry.done === false ){
        if( station_name === entry.value[1] ){
            return entry.value[0];
        }
        entry = entries.next();
    }
    console.log( "ERROR - Unknown station name: " + station_name );
    return "XXX";
}

function calculate_departure_date_time_from_time_only( departureTimeAsString, currentTime ){
    let departureTime =  currentTime;
    set_time_on_date( departureTime, departureTimeAsString );
    if((currentTime.getHours()-2) > departureTime.getHours() ){
        return new Date( departureTime.getTime() + (TWENTY_FOUR_HOURS * 1000) );
    }else{
        return departureTime;
    }
}

function update_train_UI( model ){

    for( i = 0; i < model.commutes.length; i++ ){
        commute = model.commutes[i];
        startingStationName = model.stationCodeToNameMap.get( commute.from );
        let border = '';
        if( i === 0 ){
            border = 'border-top';
        }else{
            border = 'border-top border-left';
        }

        $('#train-travel').append( "<div class='col "+ border +" align-top'><div id='"+ commute.from +"' class='pt-2'></div></div>");

        let station_element_id = "#" + commute.from

        $(station_element_id).html(
            '<div class="row">'
            +'  <div class="col h5 text-center">'+ TRAIN_GLYPH + startingStationName + '</div>'
            + '</div>'
        );

        for( j = 0; j < commute.trains.length; j++ ){
            let now = new Date();
            let train_details = commute.trains[j];
            if( now < train_details.departureTime ){
                platform = train_details.platform == null ? '': '['+ train_details.platform + '] ';
                let transportId =  commute.from + '-' + train_details.destination + '-' + j;
                destination_with_color = colour_special_fields( train_details.destination, commute.to.join("|") );

                let timeBoundaries = build_time_boundaries( commute.noNeedToLeaveBefore, commute.walkTransitTime,
                                                            commute.runTransitTime, commute.driveTransitTime,
                                                            train_details.departureTime);


                let trainRow =
                     '  <div class="row text-monospace text-nowrap">'
                    +'      <div class="col-1">'+platform+'</div>'
                    +'      <div class="col-2">' + destination_with_color + '</div>'
                    +'      <div class="col-8 transit-departure-time p-0" '
                    +'   	    transport-id="' + transportId + '"'
                    +'	        display-name="' + train_details.destination + '"'
                    +'	        noNeedToLeaveBefore="' + commute.noNeedToLeaveBefore + '"'
                    +'	        walkTransitTime="' + commute.walkTransitTime + '"'
                    +'	        runTransitTime="' + commute.runTransitTime + '"'
                    +'	        driveTransitTime="' + commute.driveTransitTime + '"'
                    +' 	        index="' + j + '"'
                    +'   	    scheduled-time="' + train_details.departureTime + '">'
                    +           build_transport_eta_countdown_element( timeBoundaries, transportId );
                    +'      </div>'
                    +'</div>';

                $(station_element_id).append( trainRow );
            }
        }
    }
}

function build_transport_eta_countdown_element( timeBoundaries, transportId  ){
    let boundaryWindow = get_boundary_window( timeBoundaries );
    let classForBoundaryWindow = get_class_for_boundary_window( boundaryWindow );
    let countDownTime = display_time_period_from_seconds_into_future(get_seconds_until( timeBoundaries.deadLine));
    let paddedTimeMinutes = get_padded_time_minutes(timeBoundaries.deadLine)
    let div =
         '          <div class="row">'
        +'              <div class="col-3 text-'+ classForBoundaryWindow +'">'+ countDownTime +'</div>'
        +'              <div class="col-2"></div>'
        +'              <div class="col-2 text-'+ classForBoundaryWindow +'">'+ paddedTimeMinutes +' ' + boundaryWindow.travelEmoji + '</div>'
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

function build_school_run_countdown_element( timeBoundaries  ){
    let boundaryWindow = get_boundary_window( timeBoundaries );
    let classForBoundaryWindow = get_class_for_boundary_window( boundaryWindow );
    let countDownTime = display_time_period_from_seconds_into_future(get_seconds_until( timeBoundaries.deadLine));
    let paddedTimeMinutes = get_padded_time_minutes(timeBoundaries.deadLine)
    let div =
         ' <div class="col text-'+ classForBoundaryWindow +'">🏫'+ countDownTime + ' ' + boundaryWindow.schoolRunEmoji +' </div>'
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

        let now = new Date();
        let departTimeElement = $("#school-run-departure-time");

        if( ( is_week_day( now ) || is_debug_on() )
            && schoolRunCountDown.showCountDown < now
            && now < schoolRunCountDown.stopCountDown ){
            departTimeElement.removeClass('d-none');
            let secondsUntilDeparture = display_time_period_from_seconds_into_future( get_seconds_until( schoolRunCountDown.departureTime ));
            let timeBoundaries = {}
            timeBoundaries.tooEarly = schoolRunCountDown.getOutOfBedBy;
            timeBoundaries.plentyOfTime = schoolRunCountDown.finishGettingDressedBy;
            timeBoundaries.moveQuickerTime = schoolRunCountDown.finishBreakfastBy;
            timeBoundaries.almostOutOfTime = schoolRunCountDown.putOnShoesBy;
            timeBoundaries.deadLine = schoolRunCountDown.departureTime;
            departTimeElement.html( build_school_run_countdown_element( timeBoundaries ));
        } else {
            departTimeElement.addClass('d-none');
        }
    }
}

function get_boundary_window( timeBoundaries, secondsUntilTargetTime ){

    if( !secondsUntilTargetTime && secondsUntilTargetTime !== 0 ){
        secondsUntilTargetTime = get_seconds_until( timeBoundaries.deadLine);
    }
    let boundaryWindow = {};
     if ( secondsUntilTargetTime > timeBoundaries.tooEarly ) {
        boundaryWindow.top = secondsUntilTargetTime;
        boundaryWindow.bottom =  timeBoundaries.tooEarly;
        boundaryWindow.name = TOO_EARLY;
        boundaryWindow.travelEmoji = "";
        boundaryWindow.schoolRunEmoji = "🛌";
    } else if( secondsUntilTargetTime > timeBoundaries.plentyOfTime ) {
        boundaryWindow.top = timeBoundaries.tooEarly;
        boundaryWindow.bottom =  timeBoundaries.plentyOfTime;
        boundaryWindow.name = PLENTY_OF_TIME;
        boundaryWindow.travelEmoji = "🚶";
        boundaryWindow.schoolRunEmoji = " 👔️";
    } else if( secondsUntilTargetTime > timeBoundaries.moveQuickerTime ) {
        boundaryWindow.top = timeBoundaries.plentyOfTime;
        boundaryWindow.bottom =  timeBoundaries.moveQuickerTime;
        boundaryWindow.name = MOVE_QUICKER_TIME;
        boundaryWindow.travelEmoji = "🏃";
        boundaryWindow.schoolRunEmoji = " 🥣";
    } else if( secondsUntilTargetTime > timeBoundaries.almostOutOfTime ) {
        boundaryWindow.top = timeBoundaries.moveQuickerTime;
        boundaryWindow.bottom =  timeBoundaries.almostOutOfTime;
        boundaryWindow.name = ALMOST_OUT_OF_TIME;
        boundaryWindow.travelEmoji = " 🚗";
        boundaryWindow.schoolRunEmoji = " 👞";
    } else {
        boundaryWindow.top = timeBoundaries.almostOutOfTime;
        boundaryWindow.bottom = 0;
        boundaryWindow.name = OUT_OF_TIME;
        boundaryWindow.travelEmoji = "";
        boundaryWindow.schoolRunEmoji = "";
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