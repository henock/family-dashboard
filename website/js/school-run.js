
function update_school_run_ui( model, date ){
    if( model.config.showSchoolRunCountDown ){
        let schoolRunCountDownConfig = model.runtimeConfig.schoolRunCountDown;

        let todaysDate = get_date_with_dashes( date );
        if( model.data.schoolRunCountDown.todaysCountDownDate != todaysDate){
            model.data.schoolRunCountDown = build_todays_school_run_dates( schoolRunCountDownConfig, date );
            model.data.schoolRunCountDown.todaysCountDownDate = todaysDate;
        }
        let schoolRunElement = $("#school-run");
        if( ( is_week_day( date ) || is_debug_on() )
            && model.data.schoolRunCountDown.showCountDownStart < date && date < model.data.schoolRunCountDown.showCountDownStop ){
            let departTimeElement = $("#school-run-departure-time");
            schoolRunElement.removeClass('d-none');
            departTimeElement.html( build_school_run_countdown_element( model.data.schoolRunCountDown, date ));
        } else {
            schoolRunElement.addClass('d-none');
        }
    }
}

function build_school_run_countdown_element( schoolRunCountDown, date  ){
    let boundaryWindow = get_boundary_window_for_school_run( schoolRunCountDown, date );
    let classForBoundaryWindow = get_class_for_boundary_window( boundaryWindow );
    let countDownTime = display_time_period_from_seconds_into_future(get_seconds_until( schoolRunCountDown.departureTime));
    let paddedTimeMinutes = get_padded_time_minutes(schoolRunCountDown.departureTime);

    let div ='          <div class="row">'
            +'              <div class="col-4 text-'+ classForBoundaryWindow +'">🏫 '+ countDownTime + '</div>'
            +'              <div class="col-4 text-'+ classForBoundaryWindow +'">' + boundaryWindow.emoji +' </div>'
            +'              <div class="col-4 text-'+ classForBoundaryWindow +'">Depart time: '+ paddedTimeMinutes +'</div>'
            +'          </div>';

        if( boundaryWindow.name !== TOO_EARLY && boundaryWindow.name !== OUT_OF_TIME ){
            div +='     <div class="row">'
            +'              <div class="col">'
            +'                  <div class="progress" style="height: 105px;">'
            +'                      <div class="progress-bar bg-'+ classForBoundaryWindow +'" role="progressbar"'
            +'                                              aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: '+
                                                            boundaryWindow.progressBarPercentage +'%"></div>'
            +'                  </div>'
            +'              </div>'
            +'          </div>';
        }
    return div;
}

function get_boundary_window_for_school_run( schoolRunCountDown, date ){
    date = date ? date : new Date();
    let currentTimeStamp = date.getTime();
    let boundaryWindow = {};
    if ( currentTimeStamp < schoolRunCountDown.getOutOfBedBy ) {
        boundaryWindow.start = currentTimeStamp;
        boundaryWindow.end =  schoolRunCountDown.getOutOfBedBy;
        boundaryWindow.name = TOO_EARLY;
        boundaryWindow.emoji = "🛌 You should still be in bed";
    } else if( currentTimeStamp < schoolRunCountDown.finishGettingDressedBy ) {
        boundaryWindow.start = schoolRunCountDown.getOutOfBedBy;
        boundaryWindow.end =  schoolRunCountDown.finishGettingDressedBy;
        boundaryWindow.name = PLENTY_OF_TIME;
        boundaryWindow.emoji = "👔️ Get dressed";
    } else if( currentTimeStamp < schoolRunCountDown.finishBreakfastBy ) {
        boundaryWindow.start = schoolRunCountDown.finishGettingDressedBy;
        boundaryWindow.end =  schoolRunCountDown.finishBreakfastBy;
        boundaryWindow.name = MOVE_QUICKER_TIME;
        boundaryWindow.emoji = "🥣 Eat your breakfast";
    } else if(  currentTimeStamp < schoolRunCountDown.putOnShoesBy ) {
        boundaryWindow.start = schoolRunCountDown.finishBreakfastBy;
        boundaryWindow.end =  schoolRunCountDown.putOnShoesBy;
        boundaryWindow.name = ALMOST_OUT_OF_TIME;
        boundaryWindow.emoji = "👞 Put on your shoes" ;
    } else {
        boundaryWindow.start = schoolRunCountDown.putOnShoesBy;
        boundaryWindow.end = schoolRunCountDown.departureTime.getTime();
        boundaryWindow.name = OUT_OF_TIME;
        boundaryWindow.emoji =  "You are late!";
    }

    boundaryWindow.progressBarPercentage = calculate_progress_bar_percentage(   boundaryWindow.start, boundaryWindow.end, currentTimeStamp );
    return boundaryWindow;
}


function build_todays_school_run_dates( schoolRun , date ){
    date = date ? date : new Date();
    let todaysSchoolRun = {}
    let departureTime = date_from_string( schoolRun.departureTime, date ); // everything else is relative to departureTime
    todaysSchoolRun.departureTime = departureTime;
    todaysSchoolRun.showCountDownStart = date_from_string( schoolRun.showCountDownStart, departureTime ).getTime();
    todaysSchoolRun.startCountDown = date_from_string( schoolRun.startCountDown, departureTime ).getTime();
    todaysSchoolRun.getOutOfBedBy = date_from_string( schoolRun.getOutOfBedBy, departureTime ).getTime();
    todaysSchoolRun.finishGettingDressedBy = date_from_string( schoolRun.finishGettingDressedBy, departureTime ).getTime();
    todaysSchoolRun.finishBreakfastBy = date_from_string( schoolRun.finishBreakfastBy, departureTime ).getTime();
    todaysSchoolRun.putOnShoesBy = date_from_string( schoolRun.putOnShoesBy, departureTime ).getTime();
    todaysSchoolRun.stopCountDown = date_from_string( schoolRun.stopCountDown, departureTime ).getTime();
    todaysSchoolRun.showCountDownStop = date_from_string( schoolRun.showCountDownStop, departureTime ).getTime();
    return todaysSchoolRun;
}