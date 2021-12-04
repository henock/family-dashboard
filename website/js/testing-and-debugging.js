

function running_unit_tests(){
    return 'true' === get_url_parameter('testing');
}

function is_debug_on(){
    return 'true' === get_url_parameter('debug');
}

function get_url_parameter( paramToGet ){
    let searchParams = new URLSearchParams( window.location.search );
    return searchParams.get(paramToGet);
}

function compare_dates(a,b){
    return a.getTime() == b.getTime();
}

function compare_hours_and_minutes(a,b){
    return a.getHours() == b.getHours() && a.getMinutes() == b.getMinutes();
}

function compare_exact(a,b){
    return a === b;
}

function compare_with_stringify(a,b){
    return JSON.stringify(a) === JSON.stringify(b);
}

function build_time_boundaries( tooEarly, plentyOfTime, moveQuickerTime, almostOutOfTime, date ){

//    if( ! (date instanceof Date) ){
//        let date = date.split("T")[0]
//        let time = date.split("T")[1]
//        let hours = time.split(":")[0];
//        let mins = time.split(":")[1];
//    }

    let deadLine = new Date(date);
//    deadLine.setHours(hours);
//    deadLine.setMinutes(mins);


    let timeBoundaries = {}
    timeBoundaries.tooEarly = tooEarly;
    timeBoundaries.plentyOfTime = plentyOfTime;
    timeBoundaries.moveQuickerTime = moveQuickerTime;
    timeBoundaries.almostOutOfTime = almostOutOfTime;
    timeBoundaries.deadLine = deadLine;
    return timeBoundaries;
}


/// UNIT TEST RUNNER /////
function run_unit_test( function_under_test, compare_function, expected_result, parameters ){
    let result;
    //TODO - FIND A BETTER WAY
    if( parameters.length == 1 ){
        result =  window[function_under_test](parameters[0]);
    } else if( parameters.length == 2 ){
        result =  window[function_under_test](parameters[0],parameters[1]);
    } else if( parameters.length == 3 ){
        result =  window[function_under_test](parameters[0],parameters[1],parameters[2]);
    } else if( parameters.length == 4 ){
        result =  window[function_under_test](parameters[0],parameters[1],parameters[2],parameters[3]);
    } else if( parameters.length == 5 ){
        result =  window[function_under_test](parameters[0],parameters[1],parameters[2],parameters[3],parameters[4]);
    } else if( parameters.length == 6 ){
        result =  window[function_under_test](parameters[0],parameters[1],parameters[2],parameters[3],parameters[4],parameters[5]);
    }

    function add_fail_row( field_name, value ){
        return "<tr><td>" + field_name + "</td><td>: " + value + "</td></tr>";
    }

    if(compare_function( expected_result , result )){
        return '<tr><td class="text-success">Passed</td><td> ' +  function_under_test + ' </td><td>params </td><td>' + JSON.stringify( parameters ) + '</td><td> result </td><td>' +  JSON.stringify( result ) + '</td></tr>';
    }else{
        return '<tr><td colspan="6" class="text-danger">Failed<table border="1">'
                                + add_fail_row( 'function',  function_under_test )
                                + add_fail_row( 'params',  JSON.stringify( parameters ))
                                + add_fail_row( 'expected',  JSON.stringify( expected_result ))
                                + add_fail_row( 'actual',  JSON.stringify( result ))
                                + '</table></td></tr>';
    }
}



///////////////////  TESTS ////////////////////


function run_all_unit_tests(){
    let result = '<table class="pt-2" border="1">';
    result += get_seconds_until_unit_test();
    result += build_eta_visualisation_string_unit_test();
    result += find_preceding_boundary_unit_test();
    result += build_count_down_visualisation_string_unit_test();
    result += build_transport_eta_html_unit_test();
    result += build_transport_eta_html_unit_test();
    result += display_time_period_from_seconds_into_future_unit_test();
    result += '</table>';
    write_message( result , 'text-success', -1 , true );
}



function build_transport_eta_html_unit_test(){
    // calculate_departure_date_time_from_time_only( departureTimeAsString, currentTime )
    let result = '';
    result += run_unit_test( "calculate_departure_date_time_from_time_only", compare_hours_and_minutes , new Date('Sun Apr 26 2020 23:00:00 GMT+0100 (BST)'), ['23:00', new Date('Sun Apr 26 2020 23:00:00 GMT+0100 (BST)')]);
    result += run_unit_test( "calculate_departure_date_time_from_time_only", compare_hours_and_minutes , new Date('Sun Apr 27 2020 00:00:00 GMT+0100 (BST)'), ['00:00', new Date('Sun Apr 26 2020 23:00:00 GMT+0100 (BST)')]);
    result += run_unit_test( "calculate_departure_date_time_from_time_only", compare_hours_and_minutes , new Date('Sun Apr 27 2020 01:00:00 GMT+0100 (BST)'), ['01:00', new Date('Sun Apr 26 2020 23:00:00 GMT+0100 (BST)')]);
    return result;
}

function display_time_period_from_seconds_into_future_unit_test(){
    let result = '';
    result += run_unit_test("display_time_period_from_seconds_into_future", compare_exact, '00:00:10', [10]);
    result += run_unit_test("display_time_period_from_seconds_into_future", compare_exact, '00:01:00', [60]);
    result += run_unit_test("display_time_period_from_seconds_into_future", compare_exact, '00:01:01', [61]);
    result += run_unit_test("display_time_period_from_seconds_into_future", compare_exact, '01:00:00', [3600]);
    result += run_unit_test("display_time_period_from_seconds_into_future", compare_exact, '01:00:02', [3602]);
    return result;
}



function build_transport_eta_html_unit_test(){
    // build_transport_eta_html( departure_spans_builder( secondsUntilTargetTime , countDownVisualisation, timeBoundaries ), timeBoundaries, fullWidthOfSpan )
    let result = '';

    let nowPlus10 = now_plus_seconds(10);
    let hourAndMins = get_padded_time_minutes( nowPlus10 );
    let dateAsString = JSON.stringify( nowPlus10 );

    let timeBoundaries = build_time_boundaries( 100, 80, 60, 50, nowPlus10 );

    function mock_departure_spans_builder( secondsUntilTargetTime , countDownVisualisation, timeBoundaries ){
        let calledIntoMock = {}
        calledIntoMock.secondsUntilTargetTime = secondsUntilTargetTime;
        calledIntoMock.countDownVisualisation = countDownVisualisation;
        calledIntoMock.timeBoundaries = timeBoundaries;
        return JSON.stringify( calledIntoMock );
    }

    expectedResult = '{"secondsUntilTargetTime":10,' +
                       '"countDownVisualisation":"00:00:10&nbsp;->&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+ hourAndMins +'",'+
                       '"timeBoundaries":{"tooEarly":100,"plentyOfTime":80,"moveQuickerTime":60,"almostOutOfTime":50,"deadLine":'+dateAsString+'}}';

    result += run_unit_test("build_transport_eta_html", compare_exact, expectedResult, [mock_departure_spans_builder,  timeBoundaries, 5]);
    return result;
}

function build_count_down_visualisation_string_unit_test(){
    let timeBoundaries = build_time_boundaries( 100, 80, 60, 50, "2021-12-04T10:33" );
    // build_count_down_visualisation_string( secondsUntilTargetTime, timeBoundaries, fullWidthOfSpan )
    let result = '';
    result += run_unit_test("build_count_down_visualisation_string", compare_exact, '00:01:41&nbsp;->&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10:33', [101, timeBoundaries, 5]);
    result += run_unit_test("build_count_down_visualisation_string", compare_exact, '00:01:40&nbsp;->&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10:33', [100, timeBoundaries, 5]);
    result += run_unit_test("build_count_down_visualisation_string", compare_exact, '00:01:30&nbsp;->&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10:33', [90,  timeBoundaries, 5]);
    result += run_unit_test("build_count_down_visualisation_string", compare_exact, '00:01:41&nbsp;->&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10:33', [80,  timeBoundaries, 5]);
    result += run_unit_test("build_count_down_visualisation_string", compare_exact, '00:01:41&nbsp;->&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10:33', [65,  timeBoundaries, 5]);
    result += run_unit_test("build_count_down_visualisation_string", compare_exact, '00:01:41&nbsp;->&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10:33', [60,  timeBoundaries, 5]);
    result += run_unit_test("build_count_down_visualisation_string", compare_exact, '00:01:41&nbsp;->&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10:33', [59,  timeBoundaries, 5]);
    result += run_unit_test("build_count_down_visualisation_string", compare_exact, '00:01:41&nbsp;->&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10:33', [58,  timeBoundaries, 5]);
    result += run_unit_test("build_count_down_visualisation_string", compare_exact, '00:01:41&nbsp;->&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10:33', [50,  timeBoundaries, 5]);
    result += run_unit_test("build_count_down_visualisation_string", compare_exact, '00:01:41&nbsp;->&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10:33', [40,  timeBoundaries, 5]);
    result += run_unit_test("build_count_down_visualisation_string", compare_exact, '00:01:41&nbsp;->&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10:33', [30,  timeBoundaries, 5]);
    result += run_unit_test("build_count_down_visualisation_string", compare_exact, '00:01:41&nbsp;->&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10:33', [20,  timeBoundaries, 5]);
    result += run_unit_test("build_count_down_visualisation_string", compare_exact, '00:01:41&nbsp;->&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10:33', [10,  timeBoundaries, 5]);
    result += run_unit_test("build_count_down_visualisation_string", compare_exact, '00:01:41&nbsp;->&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10:33', [5,   timeBoundaries, 5]);
    result += run_unit_test("build_count_down_visualisation_string", compare_exact, '00:01:41&nbsp;->&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10:33', [1,   timeBoundaries, 5]);
    result += run_unit_test("build_count_down_visualisation_string", compare_exact, '00:00:00&nbsp;->&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10:33', [0,   timeBoundaries, 5]);
    return result;
}

// get_boundary_window
function find_preceding_boundary_unit_test(){
    let timeBoundaries = build_time_boundaries( 100, 80, 60, 50, new Date("2021-12-04T10:33"));
    let result = '';
    result += run_unit_test("get_boundary_window", compare_with_stringify, {top:110,bottom:100}, [110, timeBoundaries]);
    result += run_unit_test("get_boundary_window", compare_with_stringify, {top:100,bottom:80}, [100, timeBoundaries]);
    result += run_unit_test("get_boundary_window", compare_with_stringify, {top:100,bottom:80}, [99, timeBoundaries]);
    result += run_unit_test("get_boundary_window", compare_with_stringify, {top:100,bottom:80}, [81, timeBoundaries]);
    result += run_unit_test("get_boundary_window", compare_with_stringify, {top:80,bottom:60}, [80, timeBoundaries]);
    result += run_unit_test("get_boundary_window", compare_with_stringify, {top:50,bottom:0}, [50, timeBoundaries]);
    result += run_unit_test("get_boundary_window", compare_with_stringify, {top:50,bottom:0}, [40, timeBoundaries]);
    result += run_unit_test("get_boundary_window", compare_with_stringify, {top:50,bottom:0}, [0, timeBoundaries]);
    return result;
}

function build_eta_visualisation_string_unit_test(){
    // build_eta_visualisation_string(secondsLeft, boundaryWindow, fullWidthOfSpan )
    let result = '';
    result += run_unit_test( "build_eta_visualisation_string", compare_exact, '->&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;', [110, {top:100,bottom:0}, 5] );
    result += run_unit_test( "build_eta_visualisation_string", compare_exact, '->&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;', [100, {top:100,bottom:0}, 5] );
    result += run_unit_test( "build_eta_visualisation_string", compare_exact, '&nbsp;&nbsp;&nbsp;->&nbsp;&nbsp;', [60, {top:100,bottom:0}, 5] );
    result += run_unit_test( "build_eta_visualisation_string", compare_exact, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;->', [10, {top:100,bottom:0}, 5] );
    return result;
}

function get_seconds_until_unit_test(){
    let result = '';
    result += run_unit_test( "get_seconds_until", compare_exact, 10, [now_plus_seconds(10)] );
    result += run_unit_test( "get_seconds_until", compare_exact, 0, [now_plus_seconds(0)] );
    result += run_unit_test( "get_seconds_until", compare_exact, -10, [now_plus_seconds(-10)] );
    return result;
}