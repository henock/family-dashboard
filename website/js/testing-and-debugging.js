

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

function compare_exact(expected, actual){
    let testResult = (expected === actual);
    return {
        passed: testResult,
        expectedValue: expected,
        testedValue: actual
    }
}

function compare_with_stringify(expected, actual){
    let testResult = JSON.stringify(expected) === JSON.stringify(actual);
    return {
        passed: testResult,
        expectedValue: JSON.stringify(expected),
        testedValue: JSON.stringify(actual)
    }
}

function clone_object( o ){
    return JSON.parse(JSON.stringify( o ));
}


/// UNIT TEST RUNNER /////
function run_unit_test( function_under_test, comment, test_function, expected_result, parameters ){
    let testResult;

    function add_fail_row( field_name, value ){
        return "<tr><th>" + field_name + "</td><td> " + value + "</td></tr>";
    }

    try {
        let result =  window[function_under_test].apply(null, parameters);
        testResult = test_function( expected_result, result );
    }
    catch(err) {
        console.log( err.stack );
        testResult = {
            passed: false,
            expectedValue: 'A working test',
            testedValue: err.stack.replaceAll( "\n", "<br/>")
        }
    }

    if( testResult.passed ){
        return '<tr><td class="text-success">' +  function_under_test + ' </td><td>'
                + comment + '</td><td>'
                + JSON.stringify( testResult.testedValue ) + '</td><td>'
                + JSON.stringify( testResult.expectedValue ) + '</td></tr>';
    }else{
        return '<tr><td colspan="6" class="text-danger"><table border="1">'
                                + add_fail_row( 'function',  function_under_test )
                                + add_fail_row( 'comment',  comment )
                                + add_fail_row( 'params',  JSON.stringify( parameters ))
                                + add_fail_row( 'expected',  JSON.stringify( testResult.expectedValue ))
                                + add_fail_row( 'actual',  JSON.stringify( testResult.testedValue ))
                                + '</table></td></tr>';
    }


}

///////////////////  TESTS ////////////////////


function run_all_unit_tests(){
    let result = '<table class="pt-2" border="1">';
    result += '<tr><th>Function under test</th><th>comment</th><th>result</th><th>params passed in</th></th></tr>';
//    result += XXX_unit_test();
    result += update_model_with_weather_next_five_days_unit_test();
    result += update_model_with_weather_now_and_future_hour_unit_test();
    result += common_get_remote_weather_data_unit_test();
    result += get_train_station_departures_unit_test();
    result += extract_trains_details_unit_test();
    result += update_model_with_station_to_code_maps_unit_test();
    result += set_tasks_unit_test();
    result += update_model_with_api_keys_unit_test();
    result += update_model_with_tasks_unit_test();
    result += update_model_with_runtime_config_unit_test();
    result += setup_model_unit_test();
    result += convert_station_names_to_codes_unit_test();
    result += build_time_boundaries_unit_test();
    result += date_from_string_unit_test();
    result += extract_trains_details_unit_test_old();
    result += is_week_day_unit_test();
    result += get_boundary_window_unit_test();
    result += get_seconds_until_unit_test();
    result += display_time_period_from_seconds_into_future_unit_test();
    result += '</table>';
    write_message( result , 'text-success', -1 , true );
}

// Template for future tests
//function XXX_unit_test(){
//    let result = '';
//    function specific_compare_method( expected, model ){
//        let now = new Date();
//        let testResult =  (undefined !== model.data.tasks.todo && model.data.tasks.todo.length > 0 );
//        return {
//            passed: testResult,
//            expectedValue: 'model.data.tasks.todo is not null',
//            testedValue:   model.data.tasks
//        }
//    }
//    result += run_unit_test( "XXX", '💔',  compare_exact, 'expected_result', [model] );
//    return result;
//}


function update_model_with_weather_next_five_days_unit_test(){
    let result = '';
    function check_for_weather( expected, model ){
        let testResult =  (model.data.weather.futureDays.length > 0 );
        return {
            passed: testResult,
            expectedValue: 'model.data.weather.futureDays',
            testedValue:   model.data.weather.futureDays[0]
        }
    }

    model = setup_model(true);
    update_model_with_api_keys( model );
    update_model_with_runtime_config( model );
    result += run_unit_test( "update_model_with_weather_next_five_days", "getting future weather from local",  check_for_weather, 'expected_result', [model] );
    return result;
}

function update_model_with_weather_now_and_future_hour_unit_test(){
    let result = '';
    function check_for_weather( expected, model ){
        let testResult =  (model.data.weather.today.now.name === 'now' );
        return {
            passed: testResult,
            expectedValue: 'model.data.weather.today.now',
            testedValue:   model.data.weather.today.now
        }
    }

    model = setup_model(true);
    update_model_with_api_keys( model );
    update_model_with_runtime_config( model );
    result += run_unit_test( "update_model_with_weather_now_and_future_hour", "getting today's weather from local",  check_for_weather, 'expected_result', [model] );
    return result;
}


function common_get_remote_weather_data_unit_test(){
    let result = '';
    function check_for_weather_data( expected, model ){
        let testResult =  model.TEMP_TEST_PASSED;
        return {
            passed: testResult,
            expectedValue: 'response.data.timelines is not null',
            testedValue:   model.TEMP_RESPONSE
        }
    }

    function processResultFunction( model, response ){
        if( response.data.timelines ){
            model.TEMP_TEST_PASSED = true;
            model.TEMP_RESPONSE = response.data.timelines;
        } else {
            model.TEMP_TEST_PASSED = false;
        }
    }

    model = setup_model(true);
    update_model_with_api_keys( model );
    update_model_with_runtime_config( model );
    result += run_unit_test( "common_get_remote_weather_data", 'a valid response from local data/tomorrow-timelines-1d',
                                check_for_weather_data, 'not_used', [model, '1d', processResultFunction] );

// TODO - THIS METHOD WORKS - BUT I KEEP HITTING MY RATE LIMIT - UNCOMMENT TO TEST REMOTE DATA CALLS
//    model = setup_model(false);
//    update_model_with_api_keys( model );
//    update_model_with_runtime_config( model );
//    result += run_unit_test( "common_get_remote_weather_data", 'a valid response from http://tomorrow.io',
//                                check_for_weather_data, 'not_used', [model, '1d', processResultFunction] );
    return result;
}

function get_train_station_departures_unit_test(){
    let result = '';
    function check_for_trains( expected, model ){
        let testResult =  (model.data.commutes.startingStations.length > 0);
        return {
            passed: testResult,
            expectedValue: 'model.data.commutes.startingStations is not null',
            testedValue:   model.data.commutes.startingStations[0]
        }
    }

    let commute =  {
            from: "New Beckenham",
            noNeedToLeaveBefore: "departure-40m",
            walkTransitTime: "departure-30m",
            runTransitTime: "departure-25m",
            driveTransitTime: "departure-15m",
            direction: "to-work",
            showAllDestinations: true,
            to: [ "London Cannon Street", "London Charing Cross", "London Bridge" ]
        };

    let startingStationCode = "CST";
    model = setup_model(true);
    update_model_with_api_keys( model );
    update_model_with_station_to_code_maps(model);

    result += run_unit_test( "get_train_station_departures", 'We get data back from /test-data ',  check_for_trains, {}, [commute, startingStationCode, model] );

    model = setup_model(false);
    update_model_with_api_keys( model );
    update_model_with_station_to_code_maps(model);
    result += run_unit_test( "get_train_station_departures", 'We get data back from transportApi ',  check_for_trains, {}, [commute, startingStationCode, model] );
    return result;
}


function extract_trains_details_unit_test(){
    let result = '';
    let now = new Date();


    model = setup_model(false);
    update_model_with_station_to_code_maps(model);
    let commute = {
            platform: "2",
            aimed_departure_time: "1:32",
            destination_name: "Cambridge",
            status: "LATE",
            expected_departure_time: "1:35",
            best_arrival_estimate_mins: 14,
            best_departure_estimate_mins: 15
        };

    let expectedValue = { departureTime: date_with_dashes(now) + "T01:35:00.000Z",
                          platform: "2",
                          destination: "CBG",
                          status: "LATE" };

    result += run_unit_test( "extract_trains_details", 'expected_departure_time: now+10m',  compare_with_stringify, expectedValue , [ commute, model.stationNameToCodeMap, now] );

    commute.expected_departure_time = "10:11";
    expectedValue.departureTime=  date_with_dashes(now) + "T10:11:00.000Z";

    result += run_unit_test( "extract_trains_details", 'expected_departure_time: 10:11',  compare_with_stringify, expectedValue , [ commute, model.stationNameToCodeMap, now] );

    commute.destination_name = "bob";
    expectedValue.destination = "XXX"
    result += run_unit_test( "extract_trains_details", 'Unknown destination',  compare_with_stringify, expectedValue , [ commute, model.stationNameToCodeMap, now] );
    return result;
}


function update_model_with_station_to_code_maps_unit_test(){
    let result = '';
    function check_for_maps( expected, model ){
        let testResult =  (undefined !== model.stationNameToCodeMap && undefined !== model.stationCodeToNameMap );
        return {
            passed: testResult,
            expectedValue: 'model.stationNameToCodeMap and model.stationCodeToNameMap are not null',
            testedValue:   '<br/>model.stationNameToCodeMap.size: ' + model.stationNameToCodeMap.size +
                           '<br/>model.stationCodeToNameMap.size: ' + model.stationCodeToNameMap.size +
                           '<br/>CST => ' + model.stationCodeToNameMap.get("CST") +
                           '<br/>London Cannon Street => ' + model.stationNameToCodeMap.get("London Cannon Street")
        }
    }
    model = setup_model(false);
    result += run_unit_test( "update_model_with_station_to_code_maps", 'returns station codes from /data/station-codes.json',  check_for_maps, 'not used', [model] );
    return result;
}

function set_tasks_unit_test(){

    function check_for_tasks( expected, model ){
        let testResult =  (undefined !== model.data.tasks.todo && model.data.tasks.todo.length > 0 );
        return {
            passed: testResult,
            expectedValue: 'model.data.tasks.todo is not null',
            testedValue:   model.data.tasks
        }
    }

    //set_tasks( model )
    let result = '';
    let model = setup_model(true);
    result += run_unit_test( "set_tasks", 'we get back debugging tasks',  check_for_tasks, 'not used', [model] );

    model = setup_model(false);
    update_model_with_api_keys( model );
    result += run_unit_test( "set_tasks", 'we get back actual tasks',  check_for_tasks, 'not used', [model] );
    return result;
}


function update_model_with_api_keys_unit_test(){

    function api_key_test_function( expected, model ){
        let testResult =  (undefined !== model.apiKeys );
        return {
            passed: testResult,
            expectedValue: 'model.apiKeys is not null',
            testedValue:   model.apiKeys
        }
    }

    let result = '';
    let model = setup_model(true);
    result += run_unit_test( "update_model_with_api_keys", 'we get the debug api keys',  api_key_test_function, 'not used', [model] );

     model = setup_model(false);
    result += run_unit_test( "update_model_with_api_keys", 'we get back the actual api keys',  api_key_test_function, 'not used', [model] );
    return result;
}

function update_model_with_tasks_unit_test(){

    function next_update_time_test_function( expected, actual ){
        let now = new Date();
        let testResult = expected  === (now.getTime() > actual.data.tasks.nextUpdateTime.getTime());
        return {
            passed: testResult,
            expectedValue: 'now  > model.data.tasks.nextUpdateTime.getTime()',
            testedValue: now + '> ' + actual.data.tasks.nextUpdateTime
        }
    }

    let result = '';
    var inThePast = now_plus_seconds(-10);
    var inTheFuture = now_plus_seconds(10);

    let model = setup_model(true);
    model.config.debugging = true;
    update_model_with_runtime_config( model );
    let nextUpdateTime = now_plus_seconds( model.runtimeConfig.tasks.updateEvery );

    model.config.showTasks = false;
    result += run_unit_test( "update_model_with_tasks", 'does nothing if showTasks is false', next_update_time_test_function, true, [model] );

    model.config.showTasks = true;
    result += run_unit_test( "update_model_with_tasks", 'updates tasks if showTasks is true',  next_update_time_test_function, false, [model] );
    return result;
}



function setup_model_unit_test(){

    function test_model_setup( expected, model ){
        let testResult = (expected === model.isDefaultModel)
        return {
            passed: testResult,
            expectedValue: 'expected === model.isDefaultModel',
            testedValue: expected + '===' + model.isDefaultModel
        }
    }

    let result = '';
    result += run_unit_test( "setup_model", 'returns the default model when its undefined',  test_model_setup, true, [true] );

    model = setup_model( true );
    result += run_unit_test( "setup_model", 'return current model when its already defined',  test_model_setup, false, [true,model] );

    model = setup_model( true);
    result += run_unit_test( "setup_model", 'return the default model overwrite is true',  test_model_setup, true, [true, model, true ] );

    return result;
}

function update_model_with_runtime_config_unit_test(){
    let result = '';
    let model = setup_model(true);

    function test_for_runtime_config( expectedRuntimeConfig, actual ){
         let testResult = ( undefined !==  actual.runtimeConfig.travel.show );
         return {
                 passed: testResult,
                 expectedValue: 'model.runtimeConfig.travel.show = ' + actual.runtimeConfig.travel.show,
                 testedValue: 'model.runtimeConfig.travel.show = '+ actual.runtimeConfig.travel.show
             }
    }

    result += run_unit_test( "update_model_with_runtime_config", 'We have retrieved a valid runtimeConfig',  test_for_runtime_config, {}, [model] );
    return result;
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
    let timeBoundaries = build_time_boundaries( "departure-100s", "departure-80s", "departure-60s", "departure-50s", new Date());
    let result = '';
    //get_boundary_window( timeBoundaries, transportType, secondsUntilTargetTime )


    result += run_unit_test("get_boundary_window", 'TOO_EARLY -200 ', compare_with_stringify, {top:-200,bottom:-100, name: TOO_EARLY, emoji: '', progressBarPercentage: 0}, [timeBoundaries, PUBLIC_TRANSPORT, -200]);
    result += run_unit_test("get_boundary_window", 'TOO_EARLY -110 ', compare_with_stringify, {top:-110,bottom:-100, name: TOO_EARLY, emoji: '', progressBarPercentage: 0}, [timeBoundaries, PUBLIC_TRANSPORT, -110]);
    result += run_unit_test("get_boundary_window", 'TOO_EARLY -110  ', compare_with_stringify, {top:-110,bottom:-100, name: TOO_EARLY, emoji: '🛌', progressBarPercentage: 0}, [timeBoundaries, SCHOOL_RUN, -110 ]);
    result += run_unit_test("get_boundary_window", 'PLENTY_OF_TIME -100 ', compare_with_stringify, {top:-100,bottom:-80, name: PLENTY_OF_TIME, emoji: '🚶', progressBarPercentage: 0}, [timeBoundaries, PUBLIC_TRANSPORT, -100]);
    result += run_unit_test("get_boundary_window", 'PLENTY_OF_TIME -100 ', compare_with_stringify, {top:-100,bottom:-80, name: PLENTY_OF_TIME, emoji:' 👔️', progressBarPercentage: 0}, [timeBoundaries, SCHOOL_RUN , -100]);
    result += run_unit_test("get_boundary_window", 'PLENTY_OF_TIME -99 ', compare_with_stringify, {top:-100,bottom:-80, name: PLENTY_OF_TIME, emoji: '🚶', progressBarPercentage: 5}, [timeBoundaries, PUBLIC_TRANSPORT, -99]);
    result += run_unit_test("get_boundary_window", 'PLENTY_OF_TIME -99 ', compare_with_stringify, {top:-100,bottom:-80, name: PLENTY_OF_TIME, emoji: ' 👔️', progressBarPercentage: 5}, [timeBoundaries, SCHOOL_RUN , -99]);
    result += run_unit_test("get_boundary_window", 'PLENTY_OF_TIME -81 ', compare_with_stringify, {top:-100,bottom:-80, name: PLENTY_OF_TIME, emoji: '🚶', progressBarPercentage: 95}, [timeBoundaries, PUBLIC_TRANSPORT, -81]);
    result += run_unit_test("get_boundary_window", 'PLENTY_OF_TIME -81 ', compare_with_stringify, {top:-100,bottom:-80, name: PLENTY_OF_TIME, emoji: ' 👔️', progressBarPercentage: 95}, [timeBoundaries, SCHOOL_RUN , -81]);
    result += run_unit_test("get_boundary_window", 'MOVE_QUICKER_TIME -80 ', compare_with_stringify, {top:-80,bottom:-60, name: MOVE_QUICKER_TIME, emoji: '🏃', progressBarPercentage: 0}, [timeBoundaries, PUBLIC_TRANSPORT, -80]);
    result += run_unit_test("get_boundary_window", 'MOVE_QUICKER_TIME -80 ', compare_with_stringify, {top:-80,bottom:-60, name: MOVE_QUICKER_TIME, emoji:' 🥣', progressBarPercentage: 0}, [timeBoundaries, SCHOOL_RUN , -80]);
    result += run_unit_test("get_boundary_window", 'ALMOST_OUT_OF_TIME -51 ', compare_with_stringify, {top:-60,bottom:-50, name: ALMOST_OUT_OF_TIME, emoji: ' 🚗', progressBarPercentage: 90}, [timeBoundaries, PUBLIC_TRANSPORT, -51]);
    result += run_unit_test("get_boundary_window", 'ALMOST_OUT_OF_TIME -51 ', compare_with_stringify, {top:-60,bottom:-50, name: ALMOST_OUT_OF_TIME, emoji:' 👞', progressBarPercentage: 90}, [timeBoundaries, SCHOOL_RUN , -51]);
    result += run_unit_test("get_boundary_window", 'OUT_OF_TIME start of last boundary (-50)', compare_with_stringify, {top:-50,bottom:0, name: OUT_OF_TIME, emoji: '', progressBarPercentage: 0}, [timeBoundaries, PUBLIC_TRANSPORT, -50]);
    result += run_unit_test("get_boundary_window", 'OUT_OF_TIME -40', compare_with_stringify, {top:-50,bottom:0, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 20}, [timeBoundaries, PUBLIC_TRANSPORT, -40 ]);
    result += run_unit_test("get_boundary_window", 'OUT_OF_TIME -30 ', compare_with_stringify, {top:-50,bottom:0, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 40}, [timeBoundaries, PUBLIC_TRANSPORT, -30 ]);
    result += run_unit_test("get_boundary_window", 'OUT_OF_TIME -20 ', compare_with_stringify, {top:-50,bottom:0, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 60}, [timeBoundaries, PUBLIC_TRANSPORT, -20 ]);
    result += run_unit_test("get_boundary_window", 'OUT_OF_TIME -10 ', compare_with_stringify, {top:-50,bottom:0, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 80}, [timeBoundaries, PUBLIC_TRANSPORT, -10 ]);
    result += run_unit_test("get_boundary_window", 'OUT_OF_TIME -5 ', compare_with_stringify, {top:-50,bottom:0, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 90}, [timeBoundaries, PUBLIC_TRANSPORT, -5 ]);
    result += run_unit_test("get_boundary_window", 'OUT_OF_TIME -4 ', compare_with_stringify, {top:-50,bottom:0, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 92}, [timeBoundaries, PUBLIC_TRANSPORT, -4 ]);
    result += run_unit_test("get_boundary_window", 'OUT_OF_TIME -3 ', compare_with_stringify, {top:-50,bottom:0, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 94}, [timeBoundaries, PUBLIC_TRANSPORT, -3 ]);
    result += run_unit_test("get_boundary_window", 'OUT_OF_TIME -2 ', compare_with_stringify, {top:-50,bottom:0, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 96}, [timeBoundaries, PUBLIC_TRANSPORT, -2 ]);
    result += run_unit_test("get_boundary_window", 'OUT_OF_TIME -1 ', compare_with_stringify, {top:-50,bottom:0, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 98}, [timeBoundaries, PUBLIC_TRANSPORT, -1 ]);
    result += run_unit_test("get_boundary_window", 'OUT_OF_TIME -0 ', compare_with_stringify, {top:-50,bottom:0, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 100}, [timeBoundaries, PUBLIC_TRANSPORT, 0 ]);
    result += run_unit_test("get_boundary_window", 'OUT_OF_TIME +10 ', compare_with_stringify, {top:-50,bottom:0, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 0}, [timeBoundaries, PUBLIC_TRANSPORT, +10 ]);
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


function extract_trains_details_unit_test_old(){
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
    result += run_unit_test( "extract_trains_details", 'extract departureTime, platform, destination, status',  compare_with_stringify, expected_result, [ trainResult, mockStationNameToCodeMap, now] );
    return result;
}

function date_from_string_unit_test(){
    let result = '';
    let date = new Date("2021-12-06T07:00:00.000Z")
    result += run_unit_test( "date_from_string", 'departure-10m is 06:59:50',  compare_with_stringify, '2021-12-06T06:59:50.000Z', ['departure-10s', date ] );
    result += run_unit_test( "date_from_string", 'departure-10h is 21:00:00',  compare_with_stringify, '2021-12-05T21:00:00.000Z', ['departure-10h', date ] );
    result += run_unit_test( "date_from_string", 'departure-24h is 07:00:00 the previous day',  compare_with_stringify, '2021-12-05T07:00:00.000Z', ['departure-24h', date ] );
    result += run_unit_test( "date_from_string", 'departure-25h is 06:00:00',  compare_with_stringify, '2021-12-05T06:00:00.000Z', ['departure-25h', date ] );
    result += run_unit_test( "date_from_string", 'departure+10s is 07:00:10',  compare_with_stringify, '2021-12-06T07:00:10.000Z', ['departure+10s', date ] );
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

function build_time_boundaries_unit_test(){
    let result = '';
    let date = new Date()
    // build_time_boundaries( tooEarly, plentyOfTime, moveQuickerTime, almostOutOfTime, date )
    result += run_unit_test( "build_time_boundaries", 'correctly sets the times',  compare_with_stringify, {"tooEarly":-360000,"plentyOfTime":-4800,"moveQuickerTime":-60,"almostOutOfTime":50,"deadLine": date },
                                                                                          ["departure-100h", "departure-80m", "departure-60s", "departure+50s", date] );
    result += run_unit_test( "build_time_boundaries", 'correctly sets the times',  compare_with_stringify, {"tooEarly":-40,"plentyOfTime":-30,"moveQuickerTime":-20,"almostOutOfTime":-10,"deadLine": date },
                                                                                          ["departure-40s", "departure-30s", "departure-20s", "departure-10s", date] );
    return result;
}

function convert_station_names_to_codes_unit_test(){
    let result = '';
    let stationNameToCodeMap = new Map();
    stationNameToCodeMap.set("London Cannon Street", "LCS");
    stationNameToCodeMap.set( "London Charing Cross", "LCX");
    stationNameToCodeMap.set("London Bridge", "LGB" );
    let commuteTos = [ "London Cannon Street", "London Charing Cross", "London Bridge" ];
    result += run_unit_test( "convert_station_names_to_codes", 'returns list of correct codes',  compare_with_stringify, ["LCS", "LCX", "LGB"], [commuteTos, stationNameToCodeMap] );
    return result;
}

