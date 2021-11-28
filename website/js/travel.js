
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

        let now = new Date();
        let departTimeElement = $("#school-run-departure-time");

        if( ( is_week_day( now ) || is_debug_on() )
            && schoolRunCountDown.showCountDown < now
            && now < schoolRunCountDown.stopCountDown ){
            departTimeElement.removeClass('d-none');
            let secondsUntilDeparture = display_time_period_from_seconds( get_seconds_until( schoolRunCountDown.departureTime ));
            departTimeElement.html(
                build_transport_eta_html( build_school_run_countdown_to_departure_spans, schoolRunCountDown.departureTime,
                                            schoolRunCountDown.getOutOfBedBy ,
                                            schoolRunCountDown.finishGettingDressedBy,schoolRunCountDown.finishBreakfastBy, schoolRunCountDown.putOnShoesBy , 15));
        } else {
            departTimeElement.addClass('d-none');
        }
    }
}

function is_week_day( now ){
    let day = now.getDay();
    return day > 0 && day < 6;
}



function build_transport_eta_html( function_to_call, targetTime,  tooEarly, plentyOfTime, moveQuickerTime, almostOutOfTime, fullWidthOfSpan ){  //5
    var secondsUntilTargetTime = get_seconds_until( targetTime);
    var countDownVisualisation = build_count_down_visualisation_string( secondsUntilTargetTime, targetTime, tooEarly, fullWidthOfSpan );
    return  function_to_call( secondsUntilTargetTime , countDownVisualisation, tooEarly, plentyOfTime, moveQuickerTime, almostOutOfTime );
}


function build_count_down_visualisation_string(secondsUntilTargetTime, targetTime, startArrowMovingAt, fullWidthOfSpan ){
    return display_time_period_from_seconds(secondsUntilTargetTime)
                        + SPACE_CHARACTER
                        + build_eta_visualisation_string(secondsUntilTargetTime, startArrowMovingAt, fullWidthOfSpan) //600, 5)
                        + get_padded_time_minutes(targetTime);
}

function build_eta_visualisation_string(secondsLeft, startArrowMovingAt, fullWidthOfSpan ){
    if( secondsLeft < startArrowMovingAt ){
        let subSpanSize = startArrowMovingAt / fullWidthOfSpan;
        let arrowPos = Math.floor((startArrowMovingAt - secondsLeft)/ subSpanSize);
        str = '';
        for( var i = 0; i < fullWidthOfSpan; i ++ ){
            str += SPACE_CHARACTER;
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
            let now = new Date();
            let train_details = commute.trains[j];
            if( now < train_details.departureTime ){
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
                    +'	    noNeedToLeaveBefore="' + commute.noNeedToLeaveBefore + '"'
                    +'	    walkTransitTime="' + commute.walkTransitTime + '"'
                    +'	    runTransitTime="' + commute.runTransitTime + '"'
                    +'	    driveTransitTime="' + commute.driveTransitTime + '"'
                    +' 	    index="' + j + '"'
                    +'   	scheduled-time="' + train_details.departureTime + '">'
                    + 		build_transport_eta_html( build_transport_eta_spans, train_details.departureTime, commute.noNeedToLeaveBefore,
                                                    commute.walkTransitTime, commute.runTransitTime, commute.driveTransitTime, 5 )
                    +'	 </td>'
                    +'</tr>';

                $(station_element_id).append( tableRow );
            }
        }
    }
}


function build_transport_eta_spans( secondsUntilArrival , arrivalString, tooEarly, walkTimeSeconds, runTimeSeconds, driveTimeSeconds  ){
    if( secondsUntilArrival > tooEarly ){
        return '<span class="text-info">' + arrivalString + '</span>';
    } else if( secondsUntilArrival > walkTimeSeconds ){
        return '<span class="time-to-walk">' + arrivalString + ' 🚶</span>';
    } else if( secondsUntilArrival > runTimeSeconds ){
        return '<span class="time-to-run">' + arrivalString + ' 🏃</span>';
    } else if(  typeof driveTimeSeconds !== 'undefined'
                && secondsUntilArrival > driveTimeSeconds ){
        return '<span class="time-to-drive">' + arrivalString + ' 🚗</span>';
    }else if( secondsUntilArrival > 0 ){
        return '<span class="missed-transport">' + arrivalString + '</span>';
    } else {
        return '<span class="missed-transport">' + arrivalString + '</span>';
    }
}

function build_school_run_countdown_to_departure_spans( secondsUntilDeparture , departureString, getOutOfBedBy, finishGettingDressedBy, finishBreakfastBy, putOnShoesBy ){
    if( secondsUntilDeparture > getOutOfBedBy ){
        return '<span class="text-info">Leave for school ' + departureString + '🛌</span>';
    } else if( secondsUntilDeparture > finishGettingDressedBy ){
        return '<span class="time-to-walk">Leave for school ' + departureString + ' 👔️</span>';
    } else if( secondsUntilDeparture > finishBreakfastBy ){
        return '<span class="time-to-run">Leave for school ' + departureString + '  🥣</span>';
    } else if(  secondsUntilDeparture > putOnShoesBy ){
        return '<span class="time-to-drive">Leave for school ' + departureString + ' 👞</span>';
    }else {
        return '<span class="missed-transport">YOU ARE LATE ' + departureString + '</span>';
    }
}