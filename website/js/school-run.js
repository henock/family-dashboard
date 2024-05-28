const GO_BACK_TO_BED = "goBackToBed";
const EAT_YOUR_BREAKFAST = "eatYourBreakfast";
const GET_DRESSED = "getDressed";
const PUT_ON_YOUR_SHOES = "putOnYourShoes";

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
            build_school_run_countdown_element( model.data.schoolRunCountDown, date );
            schoolRunElement.removeClass('d-none');
        } else {
            schoolRunElement.addClass('d-none');
        }
    }
}

function build_school_run_countdown_element( schoolRunCountDown, date  ){
    let schoolRun = get_boundary_window_for_school_run( schoolRunCountDown, date );
    let classForSchoolRun = get_class_for_boundary_window( schoolRun );
    let textClassForSchoolRun = 'text-' + classForSchoolRun;
    let bgClassForSchoolRun = 'bg-' + classForSchoolRun;
    let countDownTime = display_time_period_from_seconds_into_future(get_seconds_until( schoolRunCountDown.departureTime));
    let paddedTimeMinutes = get_padded_time_minutes(schoolRunCountDown.departureTime);

    let secondTillDeparture =  $("#second-till-departure")
    secondTillDeparture.html( "🏫 School run count down" );
    secondTillDeparture.removeClass();
    secondTillDeparture.addClass( "col-5" );
    secondTillDeparture.addClass( textClassForSchoolRun );

    let currentDepartureAction =  $("#current-departure-action")
    currentDepartureAction.html( schoolRun.emoji );
    currentDepartureAction.removeClass();
    currentDepartureAction.addClass( "col-5" );
    currentDepartureAction.addClass( textClassForSchoolRun );

    let departureTime  =  $("#departure-time")
    departureTime.html( 'Depart time: '+ paddedTimeMinutes );
    departureTime.removeClass();
    departureTime.addClass( "col-5" );
    departureTime.addClass( textClassForSchoolRun );

    let schoolRunProgressBar = $("#school-run-progress-bar");
    let schoolRunProgressBarRow = $("#school-run-progress-bar-row");
    if( schoolRun.hasProgressBar ){
        schoolRunProgressBarRow.removeClass("d-none");
        schoolRunProgressBar.removeClass();
        schoolRunProgressBar.addClass("progress-bar");
        schoolRunProgressBar.addClass(bgClassForSchoolRun);
        schoolRunProgressBar.css("width",  schoolRun.progressBarPercentage +"%");
    }else{
        schoolRunProgressBarRow.addClass("d-none");
    }

}

function get_boundary_window_for_school_run( schoolRunCountDown, date ){
    date = date ? date : clock.get_Date();
    let currentTimeStamp = date.getTime();
    let departureTimeStamp = schoolRunCountDown.departureTime.getTime();
    let boundaryWindow = {};
    if ( currentTimeStamp <= schoolRunCountDown.getOutOfBedBy ) {
        boundaryWindow.start = currentTimeStamp;
        boundaryWindow.end =  schoolRunCountDown.getOutOfBedBy;
        boundaryWindow.name = GO_BACK_TO_BED;
        boundaryWindow.emoji = "🛌 You should still be in bed";
        boundaryWindow.hasProgressBar = false;
    } else if( currentTimeStamp <= schoolRunCountDown.finishBreakfastBy ) {
        boundaryWindow.start = schoolRunCountDown.getOutOfBedBy;
        boundaryWindow.end =  schoolRunCountDown.finishBreakfastBy;
        boundaryWindow.name = EAT_YOUR_BREAKFAST;
        boundaryWindow.emoji = "🥣 Eat your breakfast";
        boundaryWindow.hasProgressBar = true;
    } else if( currentTimeStamp <= schoolRunCountDown.finishGettingDressedBy ) {
        boundaryWindow.start = schoolRunCountDown.finishBreakfastBy;
        boundaryWindow.end =  schoolRunCountDown.finishGettingDressedBy;
        boundaryWindow.name = GET_DRESSED;
        boundaryWindow.emoji = "👔️ Get dressed";
        boundaryWindow.hasProgressBar = true;
    } else if(  currentTimeStamp <= departureTimeStamp ) {
        boundaryWindow.start = schoolRunCountDown.finishGettingDressedBy;
        boundaryWindow.end =  departureTimeStamp;
        boundaryWindow.name = PUT_ON_YOUR_SHOES;
        boundaryWindow.emoji = "👞 Put on your shoes" ;
        boundaryWindow.hasProgressBar = true;
    } else if(  currentTimeStamp <= schoolRunCountDown.showCountDownStop ) {
        boundaryWindow.start = schoolRunCountDown.departureTime.getTime();
        boundaryWindow.end = schoolRunCountDown.showCountDownStop;
        boundaryWindow.name = OUT_OF_TIME;
        boundaryWindow.emoji =  "You are late!";
        boundaryWindow.hasProgressBar = false;
    }

    if( boundaryWindow.hasProgressBar ){
        boundaryWindow.progressBarPercentage = calculate_progress_bar_percentage( boundaryWindow.start, boundaryWindow.end, currentTimeStamp );
    }

    return boundaryWindow;
}


function build_todays_school_run_dates( schoolRun , date ){
    date = date ? date : clock.get_Date();
    let todaysSchoolRun = {}
    let departureTime = date_from_string( schoolRun.departureTime, date ); // everything else is relative to departureTime
    todaysSchoolRun.departureTime = departureTime;
    todaysSchoolRun.showCountDownStart = date_from_string( schoolRun.showCountDownStart, departureTime ).getTime();
    todaysSchoolRun.startCountDown = date_from_string( schoolRun.startCountDown, departureTime ).getTime();
    todaysSchoolRun.getOutOfBedBy = date_from_string( schoolRun.getOutOfBedBy, departureTime ).getTime();
    todaysSchoolRun.finishBreakfastBy = date_from_string( schoolRun.finishBreakfastBy, departureTime ).getTime();
    todaysSchoolRun.finishGettingDressedBy = date_from_string( schoolRun.finishGettingDressedBy, departureTime ).getTime();
    todaysSchoolRun.showCountDownStop = date_from_string( schoolRun.showCountDownStop, departureTime ).getTime();
    return todaysSchoolRun;
}