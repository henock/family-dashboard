
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
    var stationCode = get_station_code_from_name( stationName, stationCodeToNameMap );
    return commute.to.includes(stationCode);
}

function extract_trains_details( it , stationCodeToNameMap ){
    var platform = it.platform ;
    var departureTime = calculate_departure_time_for_bad_api_time_only_value( it.aimed_departure_time  );
    var destination = get_station_code_from_name( it.destination_name, stationCodeToNameMap );

    return {
        "departureTime" : departureTime,
        "platform": platform,
        "destination":  destination
    };
}

function show_or_hide_school_run_departure_time(){
    if( familyDashboard.config.showSchoolRunCountdown ){
        let schoolRunCountDown = familyDashboard.runtimeConfig.schoolRunCountDown;

        if( !schoolRunCountDown.datesUpdate ){
            update_to_todays_dates( schoolRunCountDown );
            schoolRunCountDown.datesUpdate = true;
        }

        let now = new Date();
        let departTimeElement = $("#school-run-departure-time");

        if( schoolRunCountDown.showCountDown < now < schoolRunCountDown.stopCountDown ){
            departTimeElement.removeClass('d-none');
            let timeUntilDeparture = display_time_period_from_seconds( get_seconds_until( schoolRunCountDown.departureTime ));
            departTimeElement.html(build_school_departure_string( now, schoolRunCountDown, timeUntilDeparture ));
        } else {
            departTimeElement.addClass('d-none');
        }
    }
}

function update_to_todays_dates( schoolRunCountDown ){
    schoolRunCountDown.showCountDown = set_time_on_date( new Date(), schoolRunCountDown.showCountDown );
    schoolRunCountDown.startCountDown = set_time_on_date( new Date(), schoolRunCountDown.startCountDown );
    schoolRunCountDown.finishGettingDressedBy = set_time_on_date( new Date(), schoolRunCountDown.finishGettingDressedBy );
    schoolRunCountDown.finishBreakfastBy = set_time_on_date( new Date(), schoolRunCountDown.finishBreakfastBy );
    schoolRunCountDown.departureTime = set_time_on_date( new Date(), schoolRunCountDown.departureTime );
    schoolRunCountDown.stopCountDown = set_time_on_date( new Date(), schoolRunCountDown.stopCountDown );
}



function build_arrival_string( arrivalTime,  walkTransitTime, runTransitTime, driveTransitTime ){
     var secondsUntilArrival = get_seconds_until( arrivalTime);

    var arrivalString = display_time_period_from_seconds(secondsUntilArrival)
                        + SPACE_CHARACTER
                        + build_eta_visualisation_string(secondsUntilArrival)
                        + get_padded_time_minutes(arrivalTime);

    var tooEarly = parseInt(walkTransitTime) + parseInt(120);

    return  colour_eta_warnings( secondsUntilArrival , arrivalString, tooEarly, walkTransitTime, runTransitTime, driveTransitTime );
}

function build_eta_visualisation_string(secondsUntilArrival){
    var FULL_WIDTH = 5;
    var SECONDS_DEVIDER = 120;

    let startPosition;

    if( secondsUntilArrival < 1 ){
        startPosition = 0;
    } else if( secondsUntilArrival < 600 ){
        startPosition = Math.floor(secondsUntilArrival / SECONDS_DEVIDER);
    }else{
        startPosition = FULL_WIDTH;
    }

    var etaVisualisationString = '';
    var before = FULL_WIDTH - startPosition;
    var after = FULL_WIDTH - before;

    for (var i = 0; i < before; i++) {
        etaVisualisationString += SPACE_CHARACTER;
    }

    etaVisualisationString += '->';

    for (var i = 0; i < after; i++) {
        etaVisualisationString += SPACE_CHARACTER;
    }
    return etaVisualisationString;
}

function get_station_code_from_name( station_name, stationCodeToNameMap ){
    var entries = stationCodeToNameMap.entries();
    var entry = entries.next();
    while( entry.done === false ){
        if( station_name === entry.value[1] ){
            return entry.value[0];
        }
        entry = entries.next();
    }
    console.log( "ERROR - Unknown station name: " + station_name );
    return "XXX";
}

function calculate_departure_time_for_bad_api_time_only_value( departureTimeAsString ){
    var currentTime = new Date();
    var departureTime =  new Date();
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
        $('#train-travel').append( "<td class='p-3 border align-top'><table id='"+ commute.from +"'></table></td>");

        var station_element_id = "#" + commute.from

        $(station_element_id).html(
            '<tr class="">'
            +'  <td colspan="3" class="h5 text-left pb-2">'+ TRAIN_GLYPH + startingStationName + '</td>'
            + '</tr>'
        );

        for( j = 0; j < commute.trains.length; j++ ){
            let train_details = commute.trains[j];
            platform = train_details.platform == null ? '': '['+ SPACE_CHARACTER + train_details.platform + '] ';
            var transportId =  commute.from + '-' + train_details.destination ;
            destination_with_color = colour_special_fields( train_details.destination, commute.to.join("|") );
            var tableRow =
                '<tr class="train-departure text-monospace">'
                +'  <td>'
                +   	platform
                +'  </td>'
                +'  <td class="pr-2">' + destination_with_color + '</td>'
                +'  <td class="train transit-departure-time text-nowrap" '
                +'   	transport-id="' + transportId + '"'
                +'	    display-name="' + train_details.destination + '"'
                +'	    walkTransitTime="' + commute.walkTransitTime + '"'
                +'	    runTransitTime="' + commute.runTransitTime + '"'
                +'	    driveTransitTime="' + commute.driveTransitTime + '"'
                +' 	    index="' + j + '"'
                +'   	scheduled-time="' + train_details.departureTime + '">'
                + 		build_arrival_string( train_details.departureTime, commute.walkTransitTime,
                                                commute.runTransitTime, commute.driveTransitTime )
                +'	 </td>'
                +'</tr>';

            $(station_element_id).append( tableRow );
        }
    }
}


function colour_eta_warnings( secondsUntilArrival , arrivalString, tooEarly, walkTimeSeconds, runTimeSeconds, driveTimeSeconds  ){
    if( secondsUntilArrival > tooEarly ){
        return '<span class="text-info">' + arrivalString + '</span>';
    } else if( secondsUntilArrival > walkTimeSeconds ){
        return '<span class="time-to-walk">' + arrivalString + ' 🚶</span>';
    } else if( secondsUntilArrival > runTimeSeconds ){
        return '<span class="time-to-run">' + arrivalString + ' 🏃</span>';
    } else if(  typeof driveTimeSeconds !== 'undefined'
                && secondsUntilArrival > driveTimeSeconds ){
        return '<span class="time-to-drive">' + arrivalString + ' 🚗</span>';
    }else {
        return '<span class="missed-transport">' + arrivalString + '</span>';
    }
}

function build_school_departure_string( now, schoolRunCountDown, timeUntilDeparture ){
//    let arrowString = timeUntilDeparture + arrowString + build_eta_visualisation_string(timeUntilDeparture);
    let departureString = get_padded_time_minutes(schoolRunCountDown.departureTime);
    if( now < schoolRunCountDown.startCountDown ){
        return '<span class="text-muted">Leave for school ' +  departureString +  ' 🛌</span>';
    } else if( now < schoolRunCountDown.finishGettingDressedBy ){
        return '<span class="text-success">Leave for school ' +  departureString +  ' 👔️</span>';
    } else if( now < schoolRunCountDown.finishBreakfastBy){
        return '<span class="text-warning">Leave for school ' +  departureString +  ' 🥣</span>';
    } else if( now < schoolRunCountDown.departureTime){
        return '<span class="text-danger">Leave for school ' +  departureString +  ' 🚗</span>';
    }
}
