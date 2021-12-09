

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

function compare_time_to_string(expected,b){
    let bHours = pad_with_leading_zero( b.getHours());
    let bMins = pad_with_leading_zero( b.getMinutes());
    let bSecs = pad_with_leading_zero( b.getSeconds());
    let bTime = bHours + ':' + bMins + ':' + bSecs;
    return  expected === bTime;
}

function compare_with_stringify(a,b){
    return JSON.stringify(a) === JSON.stringify(b);
}


/// UNIT TEST RUNNER /////
function run_unit_test( function_under_test, comment, compare_function, expected_result, parameters ){
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
        return "<tr><th>" + field_name + "</td><td>: " + value + "</td></tr>";
    }

    if(compare_function( expected_result , result )){
        return '<tr><td class="text-success">' +  function_under_test + ' </td><td>'+comment+'</td><td>' +  JSON.stringify( result ) + '</td><td>' + JSON.stringify( parameters ) + '</td></tr>';
    }else{
        return '<tr><td colspan="6" class="text-danger">Failed<table border="1">'
                                + add_fail_row( 'function',  function_under_test )
                                + add_fail_row( 'comment',  comment )
                                + add_fail_row( 'params',  JSON.stringify( parameters ))
                                + add_fail_row( 'expected',  JSON.stringify( expected_result ))
                                + add_fail_row( 'actual',  JSON.stringify( result ))
                                + '</table></td></tr>';
    }
}



///////////////////  TESTS ////////////////////


function run_all_unit_tests(){
    let result = '<table class="pt-2" border="1">';
    result += '<tr><th>Function under test</th><th>comment</th><th>result</th><th>params passed in</th></th></tr>';
    result += extract_trains_details_unit_test();
    result += date_from_string_unit_test();
    result += is_week_day_unit_test();
    result += get_boundary_window_unit_test();
    result += get_seconds_until_unit_test();
    result += display_time_period_from_seconds_into_future_unit_test();
    result += '</table>';
    write_message( result , 'text-success', -1 , true );
}

function display_time_period_from_seconds_into_future_unit_test(){
    let result = '';
    result += run_unit_test("display_time_period_from_seconds_into_future", '10s', compare_exact, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10s', [10]);
    result += run_unit_test("display_time_period_from_seconds_into_future", '1m', compare_exact, '&nbsp;&nbsp;&nbsp;01:00', [60]);
    result += run_unit_test("display_time_period_from_seconds_into_future", '1m 1sec', compare_exact, '&nbsp;&nbsp;&nbsp;01:01', [61]);
    result += run_unit_test("display_time_period_from_seconds_into_future", '1h', compare_exact, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;01h', [3600]);
    result += run_unit_test("display_time_period_from_seconds_into_future", '1h & 2s (but seconds not shown)', compare_exact, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;01h', [3602]);
    result += run_unit_test("display_time_period_from_seconds_into_future", '1h & 1m', compare_exact, '&nbsp;01h&nbsp;01m', [3672]);
    return result;
}

function get_boundary_window_unit_test(){
    let timeBoundaries = build_time_boundaries( 100, 80, 60, 50, new Date("2021-12-04T10:33"));
    let result = '';
    //get_boundary_window( timeBoundaries, transportType, secondsUntilTargetTime )
    result += run_unit_test("get_boundary_window", 'TOO_EARLY ', compare_with_stringify, {top:200,bottom:100, name: TOO_EARLY, emoji: '', progressBarPercentage: 0}, [timeBoundaries, PUBLIC_TRANSPORT, 200]);
    result += run_unit_test("get_boundary_window", 'TOO_EARLY ', compare_with_stringify, {top:110,bottom:100, name: TOO_EARLY, emoji: '', progressBarPercentage: 0}, [timeBoundaries, PUBLIC_TRANSPORT, 110]);
    result += run_unit_test("get_boundary_window", 'TOO_EARLY ', compare_with_stringify, {top:110,bottom:100, name: TOO_EARLY, emoji: '🛌', progressBarPercentage: 0}, [timeBoundaries, SCHOOL_RUN, 110 ]);
    result += run_unit_test("get_boundary_window", 'PLENTY_OF_TIME ', compare_with_stringify, {top:100,bottom:80, name: PLENTY_OF_TIME, emoji: '🚶', progressBarPercentage: 0}, [timeBoundaries, PUBLIC_TRANSPORT, 100]);
    result += run_unit_test("get_boundary_window", 'PLENTY_OF_TIME ', compare_with_stringify, {top:100,bottom:80, name: PLENTY_OF_TIME, emoji:' 👔️', progressBarPercentage: 0}, [timeBoundaries, SCHOOL_RUN , 100]);
    result += run_unit_test("get_boundary_window", 'PLENTY_OF_TIME ', compare_with_stringify, {top:100,bottom:80, name: PLENTY_OF_TIME, emoji: '🚶', progressBarPercentage: 5}, [timeBoundaries, PUBLIC_TRANSPORT, 99]);
    result += run_unit_test("get_boundary_window", 'PLENTY_OF_TIME ', compare_with_stringify, {top:100,bottom:80, name: PLENTY_OF_TIME, emoji: ' 👔️', progressBarPercentage: 5}, [timeBoundaries, SCHOOL_RUN , 99]);
    result += run_unit_test("get_boundary_window", 'PLENTY_OF_TIME ', compare_with_stringify, {top:100,bottom:80, name: PLENTY_OF_TIME, emoji: '🚶', progressBarPercentage: 95}, [timeBoundaries, PUBLIC_TRANSPORT, 81]);
    result += run_unit_test("get_boundary_window", 'PLENTY_OF_TIME ', compare_with_stringify, {top:100,bottom:80, name: PLENTY_OF_TIME, emoji: ' 👔️', progressBarPercentage: 95}, [timeBoundaries, SCHOOL_RUN , 81]);
    result += run_unit_test("get_boundary_window", 'MOVE_QUICKER_TIME ', compare_with_stringify, {top:80,bottom:60, name: MOVE_QUICKER_TIME, emoji: '🏃', progressBarPercentage: 0}, [timeBoundaries, PUBLIC_TRANSPORT, 80]);
    result += run_unit_test("get_boundary_window", 'MOVE_QUICKER_TIME ', compare_with_stringify, {top:80,bottom:60, name: MOVE_QUICKER_TIME, emoji:' 🥣', progressBarPercentage: 0}, [timeBoundaries, SCHOOL_RUN , 80]);
    result += run_unit_test("get_boundary_window", 'ALMOST_OUT_OF_TIME ', compare_with_stringify, {top:60,bottom:50, name: ALMOST_OUT_OF_TIME, emoji: ' 🚗', progressBarPercentage: 90}, [timeBoundaries, PUBLIC_TRANSPORT, 51]);
    result += run_unit_test("get_boundary_window", 'ALMOST_OUT_OF_TIME ', compare_with_stringify, {top:60,bottom:50, name: ALMOST_OUT_OF_TIME, emoji:' 👞', progressBarPercentage: 90}, [timeBoundaries, SCHOOL_RUN , 51]);
    result += run_unit_test("get_boundary_window", 'OUT_OF_TIME start of last boundary (50)', compare_with_stringify, {top:50,bottom:0, name: OUT_OF_TIME, emoji: '', progressBarPercentage: 0}, [timeBoundaries, PUBLIC_TRANSPORT, 50]);
    result += run_unit_test("get_boundary_window", 'OUT_OF_TIME 40', compare_with_stringify, {top:50,bottom:0, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 20}, [timeBoundaries, PUBLIC_TRANSPORT, 40 ]);
    result += run_unit_test("get_boundary_window", 'OUT_OF_TIME 30 ', compare_with_stringify, {top:50,bottom:0, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 40}, [timeBoundaries, PUBLIC_TRANSPORT, 30 ]);
    result += run_unit_test("get_boundary_window", 'OUT_OF_TIME 20 ', compare_with_stringify, {top:50,bottom:0, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 60}, [timeBoundaries, PUBLIC_TRANSPORT, 20 ]);
    result += run_unit_test("get_boundary_window", 'OUT_OF_TIME 10 ', compare_with_stringify, {top:50,bottom:0, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 80}, [timeBoundaries, PUBLIC_TRANSPORT, 10 ]);
    result += run_unit_test("get_boundary_window", 'OUT_OF_TIME 5 ', compare_with_stringify, {top:50,bottom:0, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 90}, [timeBoundaries, PUBLIC_TRANSPORT, 5 ]);
    result += run_unit_test("get_boundary_window", 'OUT_OF_TIME 4 ', compare_with_stringify, {top:50,bottom:0, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 92}, [timeBoundaries, PUBLIC_TRANSPORT, 4 ]);
    result += run_unit_test("get_boundary_window", 'OUT_OF_TIME 3 ', compare_with_stringify, {top:50,bottom:0, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 94}, [timeBoundaries, PUBLIC_TRANSPORT, 3 ]);
    result += run_unit_test("get_boundary_window", 'OUT_OF_TIME 2 ', compare_with_stringify, {top:50,bottom:0, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 96}, [timeBoundaries, PUBLIC_TRANSPORT, 2 ]);
    result += run_unit_test("get_boundary_window", 'OUT_OF_TIME 1 ', compare_with_stringify, {top:50,bottom:0, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 98}, [timeBoundaries, PUBLIC_TRANSPORT, 1 ]);
    result += run_unit_test("get_boundary_window", 'OUT_OF_TIME 0 ', compare_with_stringify, {top:50,bottom:0, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 100}, [timeBoundaries, PUBLIC_TRANSPORT, 0 ]);
    result += run_unit_test("get_boundary_window", 'OUT_OF_TIME -10 ', compare_with_stringify, {top:50,bottom:0, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 0}, [timeBoundaries, PUBLIC_TRANSPORT, -10 ]);
    return result;
}


function get_seconds_until_unit_test(){
    let result = '';
    result += run_unit_test( "get_seconds_until", ' 10', compare_exact, 10, [now_plus_seconds(10)] );
    result += run_unit_test( "get_seconds_until", ' 0', compare_exact, 0, [now_plus_seconds(0)] );
    result += run_unit_test( "get_seconds_until", ' -10', compare_exact, -10, [now_plus_seconds(-10)] );
    return result;
}

function is_week_day_unit_test(){
    let result = '';
    result += run_unit_test( "is_week_day", '2021-12-06 - was a Monday', compare_exact, true, [new Date("2021-12-06")] );
    result += run_unit_test( "is_week_day", 'Tue', compare_exact, true, [new Date("2021-12-07")] );
    result += run_unit_test( "is_week_day", 'Wed', compare_exact, true, [new Date("2021-12-08")] );
    result += run_unit_test( "is_week_day", 'Thur', compare_exact, true, [new Date("2021-12-09")] );
    result += run_unit_test( "is_week_day", 'Fri', compare_exact, true, [new Date("2021-12-10")] );
    result += run_unit_test( "is_week_day", 'Sat', compare_exact, false, [new Date("2021-12-11")] );
    result += run_unit_test( "is_week_day", 'Sun', compare_exact, false, [new Date("2021-12-12")] );
    return result;
}

function date_from_string_unit_test(){
    let result = '';
    let date = new Date("2021-12-06T07:00:00.000Z")
    result += run_unit_test( "date_from_string", 'now+10s is 07:00:10',  compare_with_stringify, '2021-12-06T07:00:10.000Z', ['now+10s', date ] );
    result += run_unit_test( "date_from_string", 'now+10m is 07:10:00',  compare_with_stringify, '2021-12-06T07:10:00.000Z', ['now+10m', date ] );
    result += run_unit_test( "date_from_string", 'now+1h is 08:00:00',  compare_with_stringify, '2021-12-06T08:00:00.000Z', ['now+1h', date ] );
    result += run_unit_test( "date_from_string", 'now+26h is 09:00:00 the next day',  compare_with_stringify, '2021-12-07T09:00:00.000Z', ['now+26h', date ] );
    result += run_unit_test( "date_from_string", 'now-10s is 06:59:50',  compare_with_stringify, '2021-12-06T06:59:50.000Z', ['now-10s', date ] );
    result += run_unit_test( "date_from_string", 'now-10m is 06:50:00',  compare_with_stringify, '2021-12-06T06:50:00.000Z', ['now-10m', date ] );
    result += run_unit_test( "date_from_string", 'now-1h is 06:00:00',  compare_with_stringify, '2021-12-06T06:00:00.000Z', ['now-1h', date ] );
    result += run_unit_test( "date_from_string", 'now-26h is 05:00:00 the previous day',  compare_with_stringify, '2021-12-05T05:00:00.000Z', ['now-26h', date ] );
    result += run_unit_test( "date_from_string", '10:10',  compare_with_stringify, '2021-12-06T10:10:00.000Z' , ['10:10', date] );
    result += run_unit_test( "date_from_string", '24:10',  compare_with_stringify, '2021-12-07T00:10:00.000Z' , ['24:10', date] );
    return result;
}


function extract_trains_details_unit_test(){
    let result = '';

    let now = new Date();

    let trainResult =   {
                          mode: "train",
                          service: "24652005",
                          train_uid: "L15290",
                          platform: null,
                          operator: "SE",
                          operator_name: "Southeastern",
                          aimed_departure_time: "NOT-USED",
                          aimed_arrival_time: "1:41",
                          aimed_pass_time: null,
                          origin_name: "Bromley South",
                          destination_name: "London Victoria",
                          source: "Network Rail",
                          category: "OO",
                          service_timetable: {
                            id: "https://a-long-url"
                          },
                          status: "ON TIME",
                          expected_arrival_time: "1:41",
                          expected_departure_time: "now+41m",
                          best_arrival_estimate_mins: 117,
                          best_departure_estimate_mins: 117
                        }

    let expectedDepartureTime = calculate_departure_date_time_from_time_only( "now+41m", now )

    let expected_result = {  departureTime : expectedDepartureTime,
                             platform: null,
                             destination:  "VIC",
                             status: "ON TIME"
                          }

    let mockStationNameToCodeMap = { get: function(){ return "VIC"} }


    //extract_trains_details( trainDetails , stationNameToCodeMap )
    result += run_unit_test( "extract_trains_details", 'extract departureTime, platfrom, destination, status',  compare_with_stringify, expected_result, [ trainResult, mockStationNameToCodeMap, now] );
    return result;
}

// Template for future tests
//function _unit_test(){
//    let result = '';
//    result += run_unit_test( "date_from_string", 'comment',  compare_exact, 'expected_result', [params_for_method_under_test] );
//    return result;
//}
