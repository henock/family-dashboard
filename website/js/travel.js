
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


function get_boundary_window( secondsUntilTargetTime, timeBoundaries ){
    let boundaryWindow = {};
     if ( secondsUntilTargetTime > timeBoundaries.tooEarly ) {
        boundaryWindow.top = secondsUntilTargetTime;
        boundaryWindow.bottom =  timeBoundaries.tooEarly;
    } else if( secondsUntilTargetTime > timeBoundaries.plentyOfTime ) {
        boundaryWindow.top = timeBoundaries.tooEarly;
        boundaryWindow.bottom =  timeBoundaries.plentyOfTime;
    } else if( secondsUntilTargetTime > timeBoundaries.moveQuickerTime ) {
        boundaryWindow.top = timeBoundaries.plentyOfTime;
        boundaryWindow.bottom =  timeBoundaries.moveQuickerTime;
    } else if( secondsUntilTargetTime > timeBoundaries.almostOutOfTime ) {
        boundaryWindow.top = timeBoundaries.moveQuickerTime;
        boundaryWindow.bottom =  timeBoundaries.almostOutOfTime;
    } else {
        boundaryWindow.top = timeBoundaries.almostOutOfTime;
        boundaryWindow.bottom = 0;
    }
    return boundaryWindow;
}

function build_count_down_visualisation_string(secondsUntilTargetTime, timeBoundaries, fullWidthOfSpan ){

//<div class="row text-monospace text-nowrap">
//    <div class="col-1"></div>
//    <div class="col-2"><span class="text-success">BFR</span></div>
//    <div class="col-8 transit-departure-time p-0" transport-id="RVB-BFR" display-name="BFR" noneedtoleavebefore="2100" walktransittime="1800" runtransittime="900" drivetransittime="600" index="1" scheduled-time="Sat Dec 04 2021 14:58:00 GMT+0000 (Greenwich Mean Time)">
//    <!-- To create -->
//        <div class="row">
//            <div class="col-3 time-to-run">00:18:42</div>
//            <div class="col-5">
//                <div class="progress" style="height: 15px;">
//                    <div id="weather-update-progress-bar" class="progress-bar bg-warning" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 10.796499999999995%"></div>
//                </div>
//            </div>
//            <div class="col-2">14:58 🏃</div>
//        </div>
//    <!-- To create -->
//    </div>
//</div>

    let boundaryWindow = get_boundary_window( secondsUntilTargetTime, timeBoundaries );
    return display_time_period_from_seconds_into_future(secondsUntilTargetTime)
                        + SPACE_CHARACTER
                        + build_eta_visualisation_string(secondsUntilTargetTime, boundaryWindow, fullWidthOfSpan)
                        + get_padded_time_minutes(timeBoundaries.deadLine);
}

function build_eta_visualisation_string(secondsLeft, boundaryWindow, fullWidthOfSpan ){
    if( secondsLeft < boundaryWindow.top ){
        let windowSize = boundaryWindow.top - boundaryWindow.bottom;
        let subSpanSize =  windowSize / fullWidthOfSpan;
        let arrowPos = Math.floor((boundaryWindow.top - secondsLeft)/ subSpanSize);

//        let progressBarPercentage = futureInMillis / refreshPeriodInMillis * 100;
//        $(  '#' + id + '-progress-bar' ).attr('style', 'width: ' + (100 - progressBarPercentage) + '%');

//    <!-- To create -->
//                <div class="progress" style="height: 15px;">
//                    <div id="weather-update-progress-bar" class="progress-bar bg-warning" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 10.796499999999995%"></div>
//                </div>
//    <!-- To create -->



        str = '';
        for( var i = 0; i < fullWidthOfSpan; i ++ ){
            str += '&nbsp;';
            if( arrowPos == i ){
                str += '->';
            }
        }
        return str;
    }else {
        let str = '->';
        for( var i = 0; i < fullWidthOfSpan; i ++ ){
            str += SPACE_CHARACTER;
        }
        return str;
    }
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
                let transportId =  commute.from + '-' + train_details.destination ;
                destination_with_color = colour_special_fields( train_details.destination, commute.to.join("|") );

                let timeBoundaries = {}
                timeBoundaries.tooEarly = commute.noNeedToLeaveBefore;
                timeBoundaries.plentyOfTime = commute.walkTransitTime;
                timeBoundaries.moveQuickerTime = commute.runTransitTime;
                timeBoundaries.almostOutOfTime = commute.driveTransitTime;
                timeBoundaries.deadLine = train_details.departureTime;
                let transport_eta_html =  build_transport_eta_html( transport_countdown_departure_spans_builder, timeBoundaries, 5 );


//    <!-- To create -->
//        <div class="row">
//            <div class="col-3 time-to-run">00:18:42</div>
//            <div class="col-5">
//                <div class="progress" style="height: 15px;">
//                    <div id="weather-update-progress-bar" class="progress-bar bg-warning" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 10.796499999999995%"></div>
//                </div>
//            </div>
//            <div class="col-2">14:58 🏃</div>
//        </div>
//    <!-- To create -->
//    </div>
//</div>


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
                    + 		    transport_eta_html
                    +'      </div>'
                    +'</div>';

                $(station_element_id).append( trainRow );
            }
        }
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
            departTimeElement.html( build_transport_eta_html( build_school_run_countdown_departure_spans_builder, timeBoundaries , 15));
        } else {
            departTimeElement.addClass('d-none');
        }
    }
}

function build_transport_eta_html( departure_span_builder, timeBoundaries, fullWidthOfSpan ){
    let secondsUntilTargetTime = get_seconds_until( timeBoundaries.deadLine );
    let countDownVisualisation = build_count_down_visualisation_string( secondsUntilTargetTime, timeBoundaries, fullWidthOfSpan );
    return  departure_span_builder( secondsUntilTargetTime , countDownVisualisation, timeBoundaries );
}

function transport_countdown_departure_spans_builder( secondsUntilArrival , arrivalVisualisationString, timeBoundaries ){
    if( secondsUntilArrival > timeBoundaries.tooEarly ){
        return '<span class="text-info">' + arrivalVisualisationString + '</span>';
    } else if( secondsUntilArrival > timeBoundaries.plentyOfTime ){
        return '<span class="time-to-walk">' + arrivalVisualisationString + ' 🚶</span>';
    } else if( secondsUntilArrival > timeBoundaries.moveQuickerTime ){
        return '<span class="time-to-run">' + arrivalVisualisationString + ' 🏃</span>';
    } else if(  typeof timeBoundaries.almostOutOfTime !== 'undefined'
                && secondsUntilArrival > timeBoundaries.almostOutOfTime ){
        return '<span class="time-to-drive">' + arrivalVisualisationString + ' 🚗</span>';
    }else if( secondsUntilArrival > 0 ){
        return '<span class="missed-transport">' + arrivalVisualisationString + '</span>';
    } else {
        return '<span class="missed-transport">' + arrivalVisualisationString + '</span>';
        //Todo remove it from the list.
    }
}

function build_school_run_countdown_departure_spans_builder( secondsUntilDeparture , departureString, timeBoundaries ){
    if( secondsUntilDeparture > timeBoundaries.tooEarly ){
        return '<span class="text-info">Leave for school ' + departureString + '🛌</span>';
    } else if( secondsUntilDeparture > timeBoundaries.plentyOfTime  ){
        return '<span class="time-to-walk">Leave for school ' + departureString + ' 👔️</span>';
    } else if( secondsUntilDeparture > timeBoundaries.moveQuickerTime ){
        return '<span class="time-to-run">Leave for school ' + departureString + '  🥣</span>';
    } else if(  secondsUntilDeparture > timeBoundaries.almostOutOfTime ){
        return '<span class="time-to-drive">Leave for school ' + departureString + ' 👞</span>';
    }else {
        return '<span class="missed-transport">YOU ARE LATE ' + departureString + '</span>';
    }
}