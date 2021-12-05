

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
    result += get_boundary_window_unit_test();
    result += get_seconds_until_unit_test();
    result += display_time_period_from_seconds_into_future_unit_test();
    result += '</table>';
    write_message( result , 'text-success', -1 , true );
}

function display_time_period_from_seconds_into_future_unit_test(){
    let result = '';
    result += run_unit_test("display_time_period_from_seconds_into_future", compare_exact, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10s', [10]);
    result += run_unit_test("display_time_period_from_seconds_into_future", compare_exact, '&nbsp;&nbsp;&nbsp;01:00', [60]);
    result += run_unit_test("display_time_period_from_seconds_into_future", compare_exact, '&nbsp;&nbsp;&nbsp;01:01', [61]);
    result += run_unit_test("display_time_period_from_seconds_into_future", compare_exact, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;01h', [3600]);
    result += run_unit_test("display_time_period_from_seconds_into_future", compare_exact, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;01h', [3602]);
    result += run_unit_test("display_time_period_from_seconds_into_future", compare_exact, '&nbsp;01h&nbsp;01m', [3672]);
    return result;
}

function get_boundary_window_unit_test(){
    let timeBoundaries = build_time_boundaries( 100, 80, 60, 50, new Date("2021-12-04T10:33"));
    let result = '';
    result += run_unit_test("get_boundary_window", compare_with_stringify, {top:110,bottom:100, name: TOO_EARLY, travelEmoji: '', schoolRunEmoji: '🛌', progressBarPercentage: 0}, [timeBoundaries, 110 ]);
    result += run_unit_test("get_boundary_window", compare_with_stringify, {top:100,bottom:80, name: PLENTY_OF_TIME, travelEmoji: '🚶', schoolRunEmoji: ' 👔️', progressBarPercentage: 0}, [timeBoundaries, 100 ]);
    result += run_unit_test("get_boundary_window", compare_with_stringify, {top:100,bottom:80, name: PLENTY_OF_TIME, travelEmoji: '🚶', schoolRunEmoji: ' 👔️', progressBarPercentage: 5}, [timeBoundaries, 99 ]);
    result += run_unit_test("get_boundary_window", compare_with_stringify, {top:100,bottom:80, name: PLENTY_OF_TIME, travelEmoji: '🚶', schoolRunEmoji: ' 👔️', progressBarPercentage: 95}, [timeBoundaries, 81 ]);
    result += run_unit_test("get_boundary_window", compare_with_stringify, {top:80,bottom:60, name: MOVE_QUICKER_TIME, travelEmoji: '🏃', schoolRunEmoji: ' 🥣', progressBarPercentage: 0}, [timeBoundaries, 80 ]);
    result += run_unit_test("get_boundary_window", compare_with_stringify, {top:60,bottom:50, name: ALMOST_OUT_OF_TIME, travelEmoji: ' 🚗', schoolRunEmoji: ' 👞', progressBarPercentage: 90}, [timeBoundaries, 51 ]);
    result += run_unit_test("get_boundary_window", compare_with_stringify, {top:50,bottom:0, name: OUT_OF_TIME, travelEmoji: '', schoolRunEmoji: '', progressBarPercentage: 0}, [timeBoundaries, 50 ]);
    result += run_unit_test("get_boundary_window", compare_with_stringify, {top:50,bottom:0, name: OUT_OF_TIME, travelEmoji: '', schoolRunEmoji: '', progressBarPercentage: 20}, [timeBoundaries, 40 ]);
    result += run_unit_test("get_boundary_window", compare_with_stringify, {top:50,bottom:0, name: OUT_OF_TIME, travelEmoji: '', schoolRunEmoji: '', progressBarPercentage: 40}, [timeBoundaries, 30 ]);
    result += run_unit_test("get_boundary_window", compare_with_stringify, {top:50,bottom:0, name: OUT_OF_TIME, travelEmoji: '', schoolRunEmoji: '', progressBarPercentage: 60}, [timeBoundaries, 20 ]);
    result += run_unit_test("get_boundary_window", compare_with_stringify, {top:50,bottom:0, name: OUT_OF_TIME, travelEmoji: '', schoolRunEmoji: '', progressBarPercentage: 80}, [timeBoundaries, 10 ]);
    result += run_unit_test("get_boundary_window", compare_with_stringify, {top:50,bottom:0, name: OUT_OF_TIME, travelEmoji: '', schoolRunEmoji: '', progressBarPercentage: 90}, [timeBoundaries, 5 ]);
    result += run_unit_test("get_boundary_window", compare_with_stringify, {top:50,bottom:0, name: OUT_OF_TIME, travelEmoji: '', schoolRunEmoji: '', progressBarPercentage: 92}, [timeBoundaries, 4 ]);
    result += run_unit_test("get_boundary_window", compare_with_stringify, {top:50,bottom:0, name: OUT_OF_TIME, travelEmoji: '', schoolRunEmoji: '', progressBarPercentage: 94}, [timeBoundaries, 3 ]);
    result += run_unit_test("get_boundary_window", compare_with_stringify, {top:50,bottom:0, name: OUT_OF_TIME, travelEmoji: '', schoolRunEmoji: '', progressBarPercentage: 96}, [timeBoundaries, 2 ]);
    result += run_unit_test("get_boundary_window", compare_with_stringify, {top:50,bottom:0, name: OUT_OF_TIME, travelEmoji: '', schoolRunEmoji: '', progressBarPercentage: 98}, [timeBoundaries, 1 ]);
    result += run_unit_test("get_boundary_window", compare_with_stringify, {top:50,bottom:0, name: OUT_OF_TIME, travelEmoji: '', schoolRunEmoji: '', progressBarPercentage: 100}, [timeBoundaries, 0 ]);
    result += run_unit_test("get_boundary_window", compare_with_stringify, {top:50,bottom:0, name: OUT_OF_TIME, travelEmoji: '', schoolRunEmoji: '', progressBarPercentage: 0}, [timeBoundaries, -10 ]);
    return result;
}


function get_seconds_until_unit_test(){
    let result = '';
    result += run_unit_test( "get_seconds_until", compare_exact, 10, [now_plus_seconds(10)] );
    result += run_unit_test( "get_seconds_until", compare_exact, 0, [now_plus_seconds(0)] );
    result += run_unit_test( "get_seconds_until", compare_exact, -10, [now_plus_seconds(-10)] );
    return result;
}