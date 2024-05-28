var passedTests = 0;
var failedTests = 0;
var failedTestLinks = [];
var skippedTests = 0;
var skippedTestLinks = [];
var testCounter = 0;

function running_unit_tests(){
    return 'true' === get_url_parameter('testing');
}

function is_debug_on(){
    return 'true' === get_url_parameter('debug');
}

function is_running_remote_tests(){
    return 'true' === get_url_parameter('doNotSkipRemoteTests');
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

function compare_hours_minutes_secs(a, b){
    return (a.getHours()  === b.getHours()
            && a.getMinutes()  === b.getMinutes()
            && a.getSeconds()  === b.getSeconds());
}

function compare_html( a, b ){
    let testResult = ( a === b );
    return {
        passed: testResult,
        expectedValue: '<xmp>' + a + '</xmp>',
        testedValue:    '<xmp>' + b + '</xmp>'
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

function build_anchor_for( text, counter, aClass ){
    if( counter ){
        return '<a class="'+ aClass + '" id="' +  text + '-' + counter + '">' +  text + '</a>';
    }else {
        return '<a class="'+ aClass + '" id="' +  text + '">' +  text + '</a>';
    }
}

function build_link_to_anchor( text, counter, aClass ){
    if( counter ){
        return '<a class="'+ aClass + '" href="#' +  text + '-' + counter + '">' +  text + '</a>';
    } else {
        return '<a class="'+ aClass + '" href="#' +  text + '">' +  text + '</a>';
    }
}

function build_link_to_anchors( links ){
    let linksList = '<ol>';
    links.forEach( function(link ){
        linksList += '<li>' + link + '</li>';
    });
    linksList += '</ol>';

    return linksList;
}
function build_link_toggle_remote_tests(){
    let runningRemoteTests = is_running_remote_tests();
    let linksList ='<a href="?testing=true&doNotSkipRemoteTests='+ (!runningRemoteTests)+ '">' +(runningRemoteTests?"Dont r":"R") +
                                                                                        'un remote test.</a>';
    return linksList;
}


function skip_unit_test( function_under_test, testCounter, comment){
    skippedTests++;
    skippedTestLinks.push( build_link_to_anchor( function_under_test, testCounter, "text-warning" ));
    return '<tr class="text-warning"><td > ' + build_anchor_for( function_under_test, testCounter, "text-warning" ) + ' </td><td colspan="3">'
            + comment + '</td></tr>';
}

// TODO - ADD LOGS INTO TEST OUTPUT TABLE

/// UNIT TEST RUNNER /////
function run_unit_test( function_under_test, comment, test_function, expected_result, parameters ){
    let testResult;
    testCounter++;

    function add_fail_row( field_name, value ){
        return "<tr><th>" + field_name + "</td><td> " + value + "</td></tr>";
    }

    try {
        let result =  window[function_under_test].apply(null, parameters);
        testResult = test_function( expected_result, result, parameters );
    }
    catch(err) {
        console.log( err.stack );
        testResult = {
            passed: false,
            expectedValue: 'A working test',
            testedValue: err.stack.replaceAll( "\n", "<br/>")
        }
    }

    let anchor = ' href="#'+function_under_test +'">' + function_under_test + '</a>';
    let anchor_top_link = build_link_to_anchor( "top", null,  "text-primary" )

    if( testResult.passed ){
        passedTests++;
        return '<tr><td class="text-success">' + anchor_top_link+ ': ' +  build_anchor_for( function_under_test, testCounter, "text-success" ) + ' </td><td>'
                + comment + '</td><td>'
                + JSON.stringify( testResult.testedValue ) + '</td><td>'
                + JSON.stringify( testResult.expectedValue ) + '</td></tr>';
    }else{
        failedTests++;
        failedTestLinks.push( build_link_to_anchor( function_under_test, testCounter, "text-danger" ));

        return '<tr><td colspan="6" class="text-danger bg-secondary"><table border="1" class="m-3 bg-dark">'
                                + add_fail_row( 'Back to top',   anchor_top_link   )
                                + add_fail_row( 'function',  build_anchor_for( function_under_test, testCounter, "text-danger" ) )
                                + add_fail_row( 'comment',  comment )
                                + add_fail_row( 'params',  JSON.stringify( parameters ))
                                + add_fail_row( 'expected',  JSON.stringify( testResult.expectedValue ))
                                + add_fail_row( 'actual',  JSON.stringify( testResult.testedValue ))
                                + '</table></td></tr>';
    }
}

function write_unit_test_result( message, pass ){
    let aClass = pass ?  'text-success' : 'text-danger';
    write_message( message, aClass, -1 , true );
}


///////////////////  TESTS ////////////////////
function run_all_unit_tests(){

    let result = '<table class="pt-2" border="1">';
    result += '<tr><th>Function under test</th><th>comment</th><th>result</th><th>params passed in</th></th></tr>';
    result += set_tasks_on_model_from_remote_data_unit_test();
    result += check_for_new_code_unit_test();
    result += calculate_progress_bar_percentage_unit_test();
    result += generate_next_download_count_down_values_unit_test();
    result += build_transport_eta_countdown_element_unit_test();
    result += build_train_row_unit_test();
    result += build_todays_school_run_dates_unit_test();
    result += sanitise_dates_for_commute_config_unit_test();
    result += sanitise_dates_for_train_times_unit_test();
    result += seconds_from_string_unit_test();
    result += update_model_with_weather_next_five_days_unit_test();
    result += update_model_with_weather_now_and_future_hour_unit_test();
    result += common_get_remote_weather_data_unit_test();
    result += get_train_station_departures_unit_test();
    result += is_train_departing_in_the_future_unit_test();
    result += extract_trains_details_unit_test();
    result += update_model_with_station_to_code_maps_unit_test();
    result += download_tasks_unit_test();
    result += update_model_with_api_keys_unit_test();
    result += update_model_only_update_times_have_expired();
    result += update_model_with_runtime_config_unit_test();
    result += setup_model_unit_test();
    result += date_from_string_unit_test();
    result += is_week_day_unit_test();
    result += get_boundary_window_for_public_transport_unit_test();
    result += get_boundary_window_for_school_run_unit_test();
    result += get_seconds_until_unit_test();
    result += display_time_period_from_seconds_into_future_unit_test();
    result += '</table>';

    let totals = '<table class="p-2 border-1">'
                    + '<tr><td>'+  build_anchor_for( "top" , undefined ) +'</td></tr>'
                    + '<tr><td><a href="?">Run in normal mode.</a></td></tr>'
                    + '<tr><td><a href="?debug=true">Run in debug mode</a></td></tr>'
                    + '<tr class="text-success"><td class="display-2">Passed</td><td class="display-2">' + passedTests + '</td></tr>'
                    + '<tr class="text-warning"><td class="display-2">Skipped</td><td class="display-2">' + skippedTests + '</td><td>'+
                                                    build_link_to_anchors( skippedTestLinks )+'<br/>'+
                                                    build_link_toggle_remote_tests() +'</td></tr>'
                    + '<tr class="text-danger"><td class="display-2">Failed</td><td class="display-2">' + failedTests + '</td><td>'+
                                                    build_link_to_anchors( failedTestLinks )+'</td></tr></table>'
    write_message( totals + result , 'text-success', -1 , true );
}

// Template for future tests
//function XXX_unit_test(){
//    let result = '';
//    function specific_compare_method( expected, result, parameters ){
//        let model = parameters[0];
//        let testResult = (false);
//        return {
//            passed: testResult,
//            expectedValue: 'THIS_HAS_NOT_BEEN_SET_YET',
//            testedValue:   'THIS_HAS_NOT_BEEN_SET_YET'
//        }
//    }
//    let model = setup_model(true, false);
//    result += run_unit_test( "XXX", '💔',  specific_compare_method, 'expected_result', [model] );
//    return result;
//}

function set_tasks_on_model_from_remote_data_unit_test(){
    let result = '';
    function specific_compare_method( expected, todo, parameters ){
        let testResult = (todo.size === 3 &&
                            todo.get('Fikir').length === 1 &&
                            todo.get('Fikir')[0].name === 'Todo Task 1' &&
                            todo.get('Fikir')[0].daysSinceAssigned === 1 &&
                            todo.get('Unassigned').length === 1 &&
                            todo.get('Henock').length === 2 );
        return {
            passed: testResult,
            expectedValue: 'Three different groups of tasks Fikir(1), Henock(2), Unassigned(1)',
            testedValue:    'Todo.size: ' + todo.size + ' result: ' + (todo.size === 3) +
                            '<br/>todo.get("Fikir").length: ' + todo.get('Fikir').length + ' result: ' + (todo.get('Fikir').length === 1) +
                            '<br/>todo.get("Fikir")[0].name: ' + todo.get('Fikir')[0].name + ' result: ' + (todo.get('Fikir')[0].name === 'Todo Task 1') +
                            '<br/>todo.get("Fikir")[0].daysSinceAssigned: ' + todo.get('Fikir')[0].daysSinceAssigned + ' result: ' + (todo.get('Fikir')[0].daysSinceAssigned === 1) +
                            '<br/>todo.get("Unassigned").length: ' + todo.get('Unassigned').length + ' result: ' + (todo.get('Unassigned').length === 1) +
                            '<br/>todo.get("Henock").length === 2: ' + todo.get('Henock').length + ' result: ' + (todo.get('Henock').length === 2) +
                            '<br/>Fikir: ' + JSON.stringify( todo.get('Fikir') )  +
                            '<br/>Henock: ' + JSON.stringify( todo.get('Henock') ) +
                            '<br/>Unassigned: ' + JSON.stringify( todo.get('Unassigned') )
        }
    }
    let data = [{
        name: "Todo Task 1",
        dateLastActivity: "now-25h",
        labels: [{
            name: "Fikir",
        }]
    },{
        name: "Todo Task 1",
        dateLastActivity: "now-10s",
        labels: [{
            name: "Henock",
        }]
    },{
        name: "Todo Task 2",
        dateLastActivity: "now-10s",
        labels: [{
            name: "Henock",
        }]
    },
    {
        name: "Todo Task 1",
        dateLastActivity: "now-200h",
        labels: []
    }]


    result += run_unit_test( "set_tasks_on_model_from_remote_data", 'We convert remote tasks into the correct groups',  specific_compare_method, 'expected_result', [data] );
    return result;
}


function check_for_new_code_unit_test(){
    let result = '';
    function specific_compare_method( expected, result, parameters ){
        let model = parameters[0];
        let testResult = (expected === model.reloadFunctionHasBeenCalled);
        return {
            passed: testResult,
            expectedValue: 'model.reloadFunctionHasBeenCalled = ' + expected ,
            testedValue:   model.reloadFunctionHasBeenCalled
        }
    }

    let model = setup_model(true, false);
    model.reloadFunctionHasBeenCalled = false;

    function mock_reload_function(){
        model.reloadFunctionHasBeenCalled = true;
    }

    let date = clock.get_Date();
    model.data.reloadDashboardCheck.nextDownloadDataTime = now_plus_seconds( 5 );
    result += run_unit_test( "check_for_new_code", 'Reload page not called when time has not expired',  specific_compare_method, false, [model, mock_reload_function, date] );

    model.reloadFunctionHasBeenCalled = false;
    date = clock.get_Date()
    model.data.reloadDashboardCheck.nextDownloadDataTime = now_plus_seconds( -5 );
    result += run_unit_test( "check_for_new_code", 'Reload page called when time has expired',  specific_compare_method, true, [model, mock_reload_function, date] );
    return result;
}


function calculate_progress_bar_percentage_unit_test(){
    let result = '';
    result += run_unit_test( "calculate_progress_bar_percentage", '5%',  compare_exact, 5, [0, 200, 10] );
    result += run_unit_test( "calculate_progress_bar_percentage", '25%',  compare_exact, 25, [0, 100, 25] );
    result += run_unit_test( "calculate_progress_bar_percentage", '50%',  compare_exact, 50, [0, 500, 250] );
    result += run_unit_test( "calculate_progress_bar_percentage", '75%',  compare_exact, 75, [0, 400, 300] );
    result += run_unit_test( "calculate_progress_bar_percentage", '100% if at the end of the window',  compare_exact, 100, [100, 500, 500] );
    result += run_unit_test( "calculate_progress_bar_percentage", '0% if at the start of the window',  compare_exact, 0, [100, 500, 100] );
    result += run_unit_test( "calculate_progress_bar_percentage", '0% if before the start of the window',  compare_exact, 0, [100, 500, 10] );
    result += run_unit_test( "calculate_progress_bar_percentage", '0% if before the start of the window',  compare_exact, 0, [100, 500, 99] );
    result += run_unit_test( "calculate_progress_bar_percentage", '0% if after the end of the window',  compare_exact, 0, [100, 500, 501] );
    return result;
}

function generate_next_download_count_down_values_unit_test(){
    let result = '';

    time = clock.get_Date();
    nextDownloadDataTime = date_plus_seconds( time, 60 );

    expectedResult = {
        timeLeft: "&nbsp;&nbsp;&nbsp;01:00",
        percentage: 40
    }
    result += run_unit_test( "generate_next_download_count_down_values", '',  compare_with_stringify, expectedResult, [nextDownloadDataTime, 100, time] );
    return result;
}

function build_transport_eta_countdown_element_unit_test(){
    let result = '';

    let date = clock.get_Date();
    let dateMinus10s = date_plus_seconds( date, -10 );
    let dateMinus20s = date_plus_seconds( date, -20 );

    let train = {
        departureTime : date,
        noNeedToLeaveBeforeTimeStamp : dateMinus10s.getTime()
    };

    let transportId = "transportId";
    let timeMinutes = get_padded_time_minutes( date );
    let expectedResult = '          <div class=\"row\">              <div class=\"col-3 text-primary\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;00s</div>'+
                         '              <div class=\"col-2\"></div>              <div class=\"col-2 text-primary\">' + timeMinutes +
                         ' </div>          </div>';

    result += run_unit_test( "build_transport_eta_countdown_element", 'eta countdown element',  compare_html, expectedResult, [train, transportId,  dateMinus20s] );
    return result;
}

function build_train_row_unit_test(){

    let result = '';
    let now = clock.get_Date();
    let train = {
        "platform": 1,
        "destinationStationCode":  "VIC",
        "isCommuteToDestination": true,
    }

    let startingStations = {
        code: "CST"
    }

    let expectedResult = "<div id=\"CST-VIC-1\" class=\"row text-monospace text-nowrap\"> " +
                            "<div class=\"col-1\">[1] </div> <div class=\"col-2\"><span class=\"text-success\">VIC</span></div> " +
                            "<div id=\"CST-VIC-1-eta\" class=\"col-8 p-0\"></div></div>";

    result += run_unit_test( "build_train_row", 'valid row for commuteTo destination',  compare_html, expectedResult, [train, startingStations, 1] );


    expectedResult = "<div id=\"CST-VIC-1\" class=\"row text-monospace text-nowrap\"> " +
                            "<div class=\"col-1\">[1] </div> <div class=\"col-2\">VIC</div> " +
                            "<div id=\"CST-VIC-1-eta\" class=\"col-8 p-0\"></div></div>";

    train.isCommuteToDestination = false;
    result += run_unit_test( "build_train_row", 'valid row for non commuteTo destination',  compare_html, expectedResult, [train, startingStations, 1] );
    return result;
}


function build_todays_school_run_dates_unit_test(){
    let result = '';

    function specific_compare_method( expected, result, parameters ){
        let schoolRunCountDown = result;
        let actualDate = schoolRunCountDown.showCountDownStart;
        let testResult = ( expected == actualDate );
        return {
            passed: testResult,
            expectedValue: expected,
            testedValue:   actualDate
        }
    }

    let date = clock.get_Date();
    let dateMinus50 = date_plus_seconds( date, -50 );
    let schoolRunCountDown = {
            show: true,
            showCountDownStart: "departure-50s",
            startCountDown: "departure-45s",
            getOutOfBedBy: "departure-40s",
            finishGettingDressedBy: "departure-30s",
            finishBreakfastBy: "departure-20s",
            departureTime: "now+0s",
            showCountDownStop: "departure+10s"
       };

    result += run_unit_test( "build_todays_school_run_dates", 'departure-50s becomes ' + dateMinus50 ,  specific_compare_method, dateMinus50.getTime(), [schoolRunCountDown, date] );
    return result;
}

function sanitise_dates_for_commute_config_unit_test(){
    let result = '';

    function specific_compare_method( expected, result, parameters ){
        let commute = parameters[0];
        let actualDate = commute[0].noNeedToLeaveBefore
        let testResult = ( expected == actualDate );
        return {
            passed: testResult,
            expectedValue: expected,
            testedValue:   actualDate
        }
    }

    let commute = [{
        noNeedToLeaveBefore : "now+5s",
        minimumWalkTransitTime : "depart-10m",
        minimumRunTransitTime : "depart-5m",
        minimumDriveTransitTime : "depart-2m"
    }];

    result += run_unit_test( "sanitise_dates_for_commute_config", 'now+5 becomes 5' ,  specific_compare_method, 5, [commute] );
    return result;
}

function sanitise_dates_for_train_times_unit_test(){
    let result = '';

    function specific_compare_method( expected, result, parameters ){
        let departures = parameters[0];
        let actualDate = departures[0].departureTime
        let testResult = compare_hours_minutes_secs( expected, actualDate );
        return {
            passed: testResult,
            expectedValue: expected,
            testedValue:   actualDate
        }
    }

    let twelveTen = set_time_on_date(clock.get_Date(), "12:10");
    let departures =  [{  departureTime: "12:10" }]
    result += run_unit_test( "sanitise_dates_for_train_times", '12:10 becomes' + twelveTen ,  specific_compare_method, twelveTen, [departures] );
    return result;
}


function seconds_from_string_unit_test(){
    let result = '';
    let date = new Date("2021-12-06T07:00:00.000Z");
    result += run_unit_test( "seconds_from_string", 'departure-10s is -10s',  compare_with_stringify, -10, ['departure-10s', date ] );
    result += run_unit_test( "seconds_from_string", 'departure-10h is -3600h',  compare_with_stringify, -36000, ['departure-10h', date ] );
    result += run_unit_test( "seconds_from_string", 'departure-24h is -86400',  compare_with_stringify, -86400, ['departure-24h', date ] );
    result += run_unit_test( "seconds_from_string", 'departure-25h is -90000',  compare_with_stringify, -90000, ['departure-25h', date ] );
    result += run_unit_test( "seconds_from_string", 'departure+10s is 10',  compare_with_stringify, 10, ['departure+10s', date ] );
    result += run_unit_test( "seconds_from_string", 'now+10s is 10',  compare_with_stringify, 10, ['now+10s', date ] );
    result += run_unit_test( "seconds_from_string", 'now+10m is 600',  compare_with_stringify, 600, ['now+10m', date ] );
    result += run_unit_test( "seconds_from_string", 'now+1h is 3600',  compare_with_stringify, 3600, ['now+1h', date ] );
    result += run_unit_test( "seconds_from_string", 'now+26h is 93600',  compare_with_stringify, 93600, ['now+26h', date ] );
    result += run_unit_test( "seconds_from_string", 'now-10s is -10',  compare_with_stringify, -10, ['now-10s', date ] );
    result += run_unit_test( "seconds_from_string", 'now-10m is -600',  compare_with_stringify, -600, ['now-10m', date ] );
    result += run_unit_test( "seconds_from_string", 'now-1h is -3600',  compare_with_stringify, -3600, ['now-1h', date ] );
    result += run_unit_test( "seconds_from_string", 'now-26h is -93600',  compare_with_stringify, -93600, ['now-26h', date ] );
    result += run_unit_test( "seconds_from_string", '10:10',  compare_exact, '10:10' , ['10:10', date] );
    result += run_unit_test( "seconds_from_string", '24:10',  compare_exact, '24:10' , ['24:10', date] );
    return result;
}

function update_model_with_weather_next_five_days_unit_test(){
    let result = '';
    function check_for_weather( expected, result, parameters ){
        let model = parameters[0];
        let testResult =  (model.data.weather.futureDays.length > 0 );
        return {
            passed: testResult,
            expectedValue: 'model.data.weather.futureDays',
            testedValue:   model.data.weather.futureDays[0]
        }
    }

    model = setup_model(true, false);
    result += run_unit_test( "update_model_with_weather_next_five_days", "getting future weather from local",  check_for_weather, 'expected_result', [model] );
    return result;
}

function update_model_with_weather_now_and_future_hour_unit_test(){
    let result = '';
    function check_for_weather( expected, result, parameters ){
        let model = parameters[0];
        let testResult =  ( model.data.weather.today.now.name === 'now' );
        return {
            passed: testResult,
            expectedValue: 'model.data.weather.today.now',
            testedValue:   model.data.weather.today.now
        }
    }

    model = setup_model(true, false);
    result += run_unit_test( "update_model_with_weather_now_and_future_hour", "getting today's weather from local",  check_for_weather, 'expected_result', [model] );
    return result;
}


function common_get_remote_weather_data_unit_test(){
    let result = '';
    function check_for_weather_data( expected, result, parameters ){
        let model = parameters[0];
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

    model = setup_model(true, false);
    result += run_unit_test( "common_get_remote_weather_data", 'a valid response from local data/tomorrow-timelines-1d',
                                check_for_weather_data, 'not_used', [model, '1d', processResultFunction] );

    if(is_running_remote_tests()){
        model = setup_model(false, false);
        result += run_unit_test( "common_get_remote_weather_data", 'a valid response from http://tomorrow.io',
                                    check_for_weather_data, 'not_used', [model, '1d', processResultFunction] );
    }else{
        result += skip_unit_test( "common_get_remote_weather_data", testCounter, 'a valid response from http://tomorrow.io' );
    }
    return result;
}

function get_train_station_departures_unit_test(){
    let result = '';
    function check_for_trains( expected, result, parameters ){
        let model = parameters[1];
        let testResult =  (model.data.trains.startingStations.length > 0);
        return {
            passed: testResult,
            expectedValue: 'model.data.trains.startingStations is not null',
            testedValue:   model.data.trains.startingStations[0]
        }
    }

    let startingStation =  {
            from: "New Beckenham",
            noNeedToLeaveBefore: "departure-40m",
            minimumWalkTransitTime: "departure-30m",
            minimumRunTransitTime: "departure-25m",
            minimumDriveTransitTime: "departure-15m",
            direction: "to-work",
            showAllDestinations: true,
            to: [ "London Cannon Street", "London Charing Cross", "London Bridge" ]
        };

    model = setup_model(true, false);

    result += run_unit_test( "get_train_station_departures", 'We get data back from /test-data ',  check_for_trains, {}, [startingStation,  model] );

    if(is_running_remote_tests()){
        model = setup_model(false, false);
        result += run_unit_test( "get_train_station_departures", 'We get data back from transportApi ',  check_for_trains, {}, [startingStation, model] );
    }else{
        result += skip_unit_test( "get_train_station_departures", testCounter, 'We get data back from transportApi' );
    }
    return result;
}

function is_train_departing_in_the_future_unit_test(){
    let now = clock.get_Date();
    let nowPlus20Seconds = date_plus_seconds( now , 20 );
    let result = run_unit_test( 'is_train_departing_in_the_future', "Train is in the future +20minutes", compare_exact, true, [now , nowPlus20Seconds] );
    return result;
}


function extract_trains_details_unit_test(){
    let result = '';
    let now = clock.get_Date();

    function create_expected_result_with( departureTime, startingStation, commute, isCommuteToDestination ){
        return {
           departureTime               : departureTime,
           departureTimeStamp          : departureTime.getTime(),
           platform                    : startingStation.platform,
           destinationStationCode      : "CST",
           status                      : startingStation.status,
           isCommuteToDestination      : isCommuteToDestination,
           noNeedToLeaveBeforeTimeStamp: date_plus_seconds( departureTime, commute.noNeedToLeaveBefore ).getTime(),
           minimumWalkTransitTimeStamp        : date_plus_seconds( departureTime, commute.minimumWalkTransitTime ).getTime(),
           minimumRunTransitTimeStamp         : date_plus_seconds( departureTime, commute.minimumRunTransitTime ).getTime(),
           minimumDriveTransitTimeStamp       : date_plus_seconds( departureTime, commute.minimumDriveTransitTime ).getTime()
       }
    }

    model = setup_model(true, false);

    let commute = {
        noNeedToLeaveBefore : -40,
        minimumWalkTransitTime     : -30,
        minimumRunTransitTime      : -20,
        minimumDriveTransitTime    : -10
    };

    let startingStation = {
        platform: "2",
        aimed_departure_time: "1:32",
        destination_name: "London Cannon Street",
        expected_departure_time: "1:35"
    };

    let departureTime = set_time_on_date( now, startingStation.expected_departure_time );
    let isCommuteToDestination = true;

    let expectedResult = create_expected_result_with( now, startingStation, commute, isCommuteToDestination );


    result += run_unit_test( "extract_trains_details", 'expected_departure_time: now+10m',  compare_with_stringify,
                    expectedResult , [ commute, startingStation, isCommuteToDestination, model.stationNameToCodeMap, now] );

    let newTimeString = "10:11";
    let newDepartureTime = set_time_on_date( now, newTimeString );
    startingStation.expected_departure_time = newDepartureTime;

    isCommuteToDestination = false;
    expectedResult = create_expected_result_with( newDepartureTime, startingStation, commute, isCommuteToDestination );

    result += run_unit_test( "extract_trains_details", 'expected_departure_time: 10:11',  compare_with_stringify,
                    expectedResult , [ commute, startingStation, isCommuteToDestination, model.stationNameToCodeMap, now] );

    newDepartureTime = set_time_on_date( now, startingStation.aimed_departure_time );
    startingStation.expected_departure_time = undefined;
    startingStation.destination_name = "bob";

    expectedResult = create_expected_result_with( newDepartureTime, startingStation, commute, isCommuteToDestination );
    expectedResult.destinationStationCode = "XXX";

    result += run_unit_test( "extract_trains_details", 'Unknown destination and using aimed_departure_time of 1.32',  compare_with_stringify,
                    expectedResult , [ commute, startingStation, isCommuteToDestination, model.stationNameToCodeMap, now] );
    return result;
}


function update_model_with_station_to_code_maps_unit_test(){
    let result = '';
    function check_for_maps( expected, result, parameters ){
        let model = parameters[0];
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
    model = setup_model(true, false);
    result += run_unit_test( "update_model_with_station_to_code_maps", 'returns station codes from /data/station-codes.json',  check_for_maps, 'not used', [model] );
    return result;
}

function download_tasks_unit_test(){

    function check_for_tasks( expected, result, parameters ){
        let model = parameters[0];
        let testResult =  (undefined !== model.data.tasks.todo && model.data.tasks.todo.size > 0 );
        return {
            passed: testResult,
            expectedValue: 'model.data.tasks.todo is not null',
            testedValue:   model.data.tasks
        }
    }

    let result = '';
    let model = setup_model(true, false);
    result += run_unit_test( "download_tasks", 'we get back debugging tasks',  check_for_tasks, 'not used', [model] );

    if(is_running_remote_tests()){
        model = setup_model(false, false);
        result += run_unit_test( "download_tasks", 'we get back actual tasks from trello.com',  check_for_tasks, 'not used', [model] );
    }else{
        result += skip_unit_test( "download_tasks", testCounter, 'we get back actual tasks from trello.com' );
    }
    return result;
}


function update_model_with_api_keys_unit_test(){

    function api_key_test_function( expected, result, parameters ){
        let model = parameters[0];
        let testResult =  (undefined !== model.apiKeys );
        return {
            passed: testResult,
            expectedValue: 'model.apiKeys is not null',
            testedValue:   model.apiKeys
        }
    }

    let result = '';
    let model = setup_model(true, false);
    result += run_unit_test( "update_model_with_api_keys", 'we get the debug api keys',  api_key_test_function, 'not used', [model] );

    return result;
}

function update_model_only_update_times_have_expired(){

    let result = '';

    let model = setup_model(true, false);
    model.config.showTasks = true; // in case it has been switched off by user

    // update_model_with_tasks
    function next_update_time_for_tasks_test_function( expectedTime, result, parameters ){
        let model = parameters[0];
        let nextDownloadDataTime = model.data.tasks.nextDownloadDataTime;
        let testResult = compare_hours_minutes_secs( expectedTime, nextDownloadDataTime );
        return {
            passed: testResult,
            expectedValue: 'expectedTime === model.data.tasks.nextDownloadDataTime',
            testedValue: expectedTime + ' === ' + model.data.tasks.nextDownloadDataTime
        }
    }

    let now = clock.get_Date()
    model.data.tasks.nextDownloadDataTime = now_plus_seconds( -2 );
    let expectedTime = date_plus_seconds( now,  model.runtimeConfig.tasks.updateEvery );
    result += run_unit_test( "update_model_with_tasks", 'updates model with tasks because nextDownloadDataTime has passed'
                            , next_update_time_for_tasks_test_function, expectedTime, [model, now] );


    now = clock.get_Date()
    model.data.tasks.nextDownloadDataTime = now_plus_seconds(20);
    expectedTime = model.data.tasks.nextDownloadDataTime;
    result += run_unit_test( "update_model_with_tasks", "doesn't updates model with tasks because nextDownloadDataTime has not passed"
                            , next_update_time_for_tasks_test_function, expectedTime, [model, now] );

    ///update_model_with_weather
    function next_update_time_for_weather_test_function( expectedTime, result, parameters ){
        let model = parameters[0];
        let nextDownloadDataTime = model.data.weather.nextDownloadDataTime;
        let testResult = compare_hours_minutes_secs( expectedTime, nextDownloadDataTime );
        return {
            passed: testResult,
            expectedValue: 'expectedTime === model.data.weather.nextDownloadDataTime',
            testedValue: expectedTime + ' === ' + model.data.weather.nextDownloadDataTime
        }
    }
    model.data.weather.nextDownloadDataTime = now_plus_seconds( -2 );
    expectedTime = now_plus_seconds( model.runtimeConfig.weather.updateEvery );

    result += run_unit_test( "update_model_with_weather", 'updates model with weather because nextDownloadDataTime has passed'
                            , next_update_time_for_weather_test_function, expectedTime, [model, clock.get_Date()] );


    model.data.weather.nextDownloadDataTime = now_plus_seconds( 2 );
    expectedTime = model.data.weather.nextDownloadDataTime;
    result += run_unit_test( "update_model_with_weather", "doesn't updates model with weather because nextDownloadDataTime has not passed"
                            , next_update_time_for_weather_test_function, expectedTime, [model, clock.get_Date()] );

    //update_model_with_trains
    function next_update_time_for_trains_test_function( expectedTime, result, parameters ){
        let model = parameters[0];
        let nextDownloadDataTime = model.data.trains.nextDownloadDataTime;
        let testResult = compare_hours_minutes_secs( expectedTime, nextDownloadDataTime );
        return {
            passed: testResult,
            expectedValue: 'expectedTime === model.data.trains.nextDownloadDataTime',
            testedValue: expectedTime + ' === ' + model.data.trains.nextDownloadDataTime
        }
    }
    model.data.trains.nextDownloadDataTime = now_plus_seconds( -2 );
    expectedTime = now_plus_seconds( model.runtimeConfig.trains.updateEvery );

    result += run_unit_test( "update_model_with_trains", 'updates model with trains data because nextDownloadDataTime has passed'
                            , next_update_time_for_trains_test_function, expectedTime, [model, clock.get_Date()] );


    model.data.trains.nextDownloadDataTime = now_plus_seconds( model.runtimeConfig.trains.updateEvery + 2 );
    expectedTime = model.data.trains.nextDownloadDataTime;
    result += run_unit_test( "update_model_with_trains", "doesn't updates model with trains data because nextDownloadDataTime has not passed"
                            , next_update_time_for_trains_test_function, expectedTime, [model, clock.get_Date()] );
    return result;
}



function setup_model_unit_test(){

    function test_model_setup( expected, result, parameters ){
        let model = result;
        let testResult = (expected === model.config.debugging )
        return {
            passed: testResult,
            expectedValue: 'expected === model.isDefaultModel',
            testedValue: expected + '===' + model.isDefaultModel
        }
    }

    let result = '';
    result += run_unit_test( "setup_model", 'returns the default model with debugging on',  test_model_setup, true, [true, false] );

    result += run_unit_test( "setup_model", 'return the default model with debugging off',  test_model_setup, false, [false, false] );

    return result;
}

function update_model_with_runtime_config_unit_test(){
    let result = '';
    let model = setup_model(true, false);

    function test_for_runtime_config( expectedRuntimeConfig, result, parameters ){
        let model = parameters[0];
        let testResult = ( undefined !==  model.runtimeConfig.trains.show );
        return {
            passed: testResult,
            expectedValue: 'model.runtimeConfig.trains.show = ' + model.runtimeConfig.trains.show,
            testedValue: 'model.runtimeConfig.trains.show = '+ model.runtimeConfig.trains.show
        }
    }

    result += run_unit_test( "update_model_with_runtime_config", 'We have retrieved a valid runtimeConfig',  test_for_runtime_config, {}, [model] );
    return result;
}

function display_time_period_from_seconds_into_future_unit_test(){
    let result = '';
    result += run_unit_test("display_time_period_from_seconds_into_future", '10s', compare_exact, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10s', [10]);
    result += run_unit_test("display_time_period_from_seconds_into_future", '1m', compare_exact, '&nbsp;&nbsp;&nbsp;01:00', [60]);
    result += run_unit_test("display_time_period_from_seconds_into_future", '1m 1sec', compare_exact, '&nbsp;&nbsp;&nbsp;01:01', [61]);
    result += run_unit_test("display_time_period_from_seconds_into_future", '1h', compare_exact, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;01h', [3600]);
    result += run_unit_test("display_time_period_from_seconds_into_future", '1h & 2s (but seconds not shown)', compare_exact, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;01h', [3602]);
    result += run_unit_test("display_time_period_from_seconds_into_future", '1h & 1m', compare_exact, '&nbsp;01h&nbsp;01m', [3672]);
    return result;
}

function get_boundary_window_for_public_transport_unit_test(){
    let result = '';

    let departureTime = new Date("2021-12-06T07:00:00.000Z");

    let transport = {
        departureTime : departureTime,
        departureTimeStamp : departureTime.getTime(),
        noNeedToLeaveBeforeTimeStamp:  date_plus_seconds( departureTime, -100 ).getTime(),
        minimumWalkTransitTimeStamp:  date_plus_seconds( departureTime, -80 ).getTime(),
        minimumRunTransitTimeStamp:  date_plus_seconds( departureTime, -60 ).getTime(),
        minimumDriveTransitTimeStamp:  date_plus_seconds( departureTime, -50 ).getTime()
    };

    result += run_unit_test("get_boundary_window_for_public_transport", 'TOO_EARLY -200 ', compare_with_stringify, {start:1638773800000,end:1638773900000, name: TOO_EARLY, emoji: '', progressBarPercentage: 0}, [transport, date_plus_seconds( departureTime, -200 )]);
    result += run_unit_test("get_boundary_window_for_public_transport", 'PLENTY_OF_TIME -100 ', compare_with_stringify, {start:1638773900000,end:1638773920000, name: PLENTY_OF_TIME, emoji: '🚶', progressBarPercentage: 0}, [transport, date_plus_seconds( departureTime, -100 )]);
    result += run_unit_test("get_boundary_window_for_public_transport", 'PLENTY_OF_TIME -99 ', compare_with_stringify, {start:1638773900000,end:1638773920000, name: PLENTY_OF_TIME, emoji: '🚶', progressBarPercentage: 5}, [transport, date_plus_seconds( departureTime, -99 )]);
    result += run_unit_test("get_boundary_window_for_public_transport", 'PLENTY_OF_TIME -81 ', compare_with_stringify, {start:1638773900000,end:1638773920000, name: PLENTY_OF_TIME, emoji: '🚶', progressBarPercentage: 95}, [transport, date_plus_seconds( departureTime, -81 )]);
    result += run_unit_test("get_boundary_window_for_public_transport", 'MOVE_QUICKER_TIME -80 ', compare_with_stringify, {start:1638773920000,end:1638773940000, name: MOVE_QUICKER_TIME, emoji: '🏃', progressBarPercentage: 0}, [transport, date_plus_seconds( departureTime, -80 )]);
    result += run_unit_test("get_boundary_window_for_public_transport", 'ALMOST_OUT_OF_TIME -51 ', compare_with_stringify, {start:1638773940000,end:1638773950000, name: ALMOST_OUT_OF_TIME, emoji: ' 🚙', progressBarPercentage: 90}, [transport, date_plus_seconds( departureTime, -51 )]);
    result += run_unit_test("get_boundary_window_for_public_transport", 'OUT_OF_TIME start of last boundary (-50)', compare_with_stringify, {start:1638773950000,end:1638774000000, name: OUT_OF_TIME, emoji: '', progressBarPercentage: 0}, [transport, date_plus_seconds( departureTime, -50 )]);
    result += run_unit_test("get_boundary_window_for_public_transport", 'OUT_OF_TIME -40', compare_with_stringify, {start:1638773950000,end:1638774000000, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 20}, [transport, date_plus_seconds( departureTime, -40  )]);
    result += run_unit_test("get_boundary_window_for_public_transport", 'OUT_OF_TIME -30 ', compare_with_stringify, {start:1638773950000,end:1638774000000, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 40}, [transport, date_plus_seconds( departureTime, -30  )]);
    result += run_unit_test("get_boundary_window_for_public_transport", 'OUT_OF_TIME -20 ', compare_with_stringify, {start:1638773950000,end:1638774000000, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 60}, [transport, date_plus_seconds( departureTime, -20  )]);
    result += run_unit_test("get_boundary_window_for_public_transport", 'OUT_OF_TIME -10 ', compare_with_stringify, {start:1638773950000,end:1638774000000, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 80}, [transport, date_plus_seconds( departureTime, -10  )]);
    result += run_unit_test("get_boundary_window_for_public_transport", 'OUT_OF_TIME -5 ', compare_with_stringify, {start:1638773950000,end:1638774000000, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 90}, [transport, date_plus_seconds( departureTime, -5  )]);
    result += run_unit_test("get_boundary_window_for_public_transport", 'OUT_OF_TIME -4 ', compare_with_stringify, {start:1638773950000,end:1638774000000, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 92}, [transport, date_plus_seconds( departureTime, -4  )]);
    result += run_unit_test("get_boundary_window_for_public_transport", 'OUT_OF_TIME -3 ', compare_with_stringify, {start:1638773950000,end:1638774000000, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 94}, [transport, date_plus_seconds( departureTime, -3  )]);
    result += run_unit_test("get_boundary_window_for_public_transport", 'OUT_OF_TIME -2 ', compare_with_stringify, {start:1638773950000,end:1638774000000, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 96}, [transport, date_plus_seconds( departureTime, -2  )]);
    result += run_unit_test("get_boundary_window_for_public_transport", 'OUT_OF_TIME -1 ', compare_with_stringify, {start:1638773950000,end:1638774000000, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 98}, [transport, date_plus_seconds( departureTime, -1  )]);
    result += run_unit_test("get_boundary_window_for_public_transport", 'OUT_OF_TIME -0 ', compare_with_stringify, {start:1638773950000,end:1638774000000, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 100}, [transport, date_plus_seconds( departureTime, 0  )]);
    result += run_unit_test("get_boundary_window_for_public_transport", 'OUT_OF_TIME +10 ', compare_with_stringify, {start:1638773950000,end:1638774000000, name: OUT_OF_TIME, emoji: '',  progressBarPercentage: 0}, [transport, date_plus_seconds( departureTime, +10  )]);

    return result;
}

function get_boundary_window_for_school_run_unit_test(){
    let result = '';

    let departureTime = new Date("2021-12-06T07:00:00.000Z");

    let schoolRunCountDown = {
        departureTime : departureTime,
        departureTimeStamp : departureTime.getTime(),
        getOutOfBedBy:  date_plus_seconds( departureTime, -100 ).getTime(),
        finishBreakfastBy:  date_plus_seconds( departureTime, -80 ).getTime(),
        finishGettingDressedBy:  date_plus_seconds( departureTime, -60 ).getTime(),
        showCountDownStop: date_plus_seconds( departureTime, 20 ).getTime()
    };

    let currentTime = date_plus_seconds( departureTime, -110  );
    result += run_unit_test("get_boundary_window_for_school_run", 'TOO_EARLY -110  ', compare_with_stringify, {start:currentTime.getTime(),end:schoolRunCountDown.getOutOfBedBy, name: GO_BACK_TO_BED, emoji: '🛌 You should still be in bed', hasProgressBar: false}, [schoolRunCountDown, currentTime]);

    currentTime = date_plus_seconds( departureTime, -101  );
    result += run_unit_test("get_boundary_window_for_school_run", 'TOO_EARLY -101 ', compare_with_stringify, {start:currentTime.getTime() ,end:schoolRunCountDown.getOutOfBedBy, name: GO_BACK_TO_BED, emoji:'🛌 You should still be in bed', hasProgressBar: false}, [schoolRunCountDown, currentTime]);

    currentTime = date_plus_seconds( departureTime, -99  );
    result += run_unit_test("get_boundary_window_for_school_run", 'EAT_YOUR_BREAKFAST -99 ', compare_with_stringify, {start:schoolRunCountDown.getOutOfBedBy ,end:schoolRunCountDown.finishBreakfastBy, name: EAT_YOUR_BREAKFAST, emoji: '🥣 Eat your breakfast', hasProgressBar: true, progressBarPercentage: 5}, [schoolRunCountDown, currentTime]);

    currentTime = date_plus_seconds( departureTime, -81  );
    result += run_unit_test("get_boundary_window_for_school_run", 'EAT_YOUR_BREAKFAST -81 ', compare_with_stringify, {start:schoolRunCountDown.getOutOfBedBy ,end:schoolRunCountDown.finishBreakfastBy, name: EAT_YOUR_BREAKFAST, emoji: '🥣 Eat your breakfast', hasProgressBar: true, progressBarPercentage: 95}, [schoolRunCountDown, currentTime]);

    currentTime = date_plus_seconds( departureTime, -80  );
    result += run_unit_test("get_boundary_window_for_school_run", 'EAT_YOUR_BREAKFAST -80 ', compare_with_stringify, {start:schoolRunCountDown.getOutOfBedBy ,end:schoolRunCountDown.finishBreakfastBy, name: EAT_YOUR_BREAKFAST, emoji:'🥣 Eat your breakfast', hasProgressBar: true, progressBarPercentage: 100}, [schoolRunCountDown, currentTime]);

    currentTime = date_plus_seconds( departureTime, -70  );
    result += run_unit_test("get_boundary_window_for_school_run", 'GET_DRESSED -70 ', compare_with_stringify, {start:schoolRunCountDown.finishBreakfastBy ,end:schoolRunCountDown.finishGettingDressedBy, name: GET_DRESSED, emoji:'👔️ Get dressed', hasProgressBar: true, progressBarPercentage: 50}, [schoolRunCountDown, currentTime]);

    currentTime = date_plus_seconds( departureTime, -51  );
    result += run_unit_test("get_boundary_window_for_school_run", 'PUT_ON_YOUR_SHOES -51 ', compare_with_stringify, {start:schoolRunCountDown.finishGettingDressedBy,end:schoolRunCountDown.departureTimeStamp, name: PUT_ON_YOUR_SHOES, emoji:'👞 Put on your shoes', hasProgressBar: true, progressBarPercentage: 15}, [schoolRunCountDown, currentTime]);

    currentTime = date_plus_seconds( departureTime, 1  );
    result += run_unit_test("get_boundary_window_for_school_run", 'OUT_OF_TIME +1', compare_with_stringify, {start:schoolRunCountDown.departureTimeStamp,end:schoolRunCountDown.showCountDownStop, name: OUT_OF_TIME, emoji: 'You are late!', hasProgressBar: false}, [schoolRunCountDown, currentTime]);

    currentTime = date_plus_seconds( departureTime, 10  );
    result += run_unit_test("get_boundary_window_for_school_run", 'OUT_OF_TIME +10 ', compare_with_stringify, {start:schoolRunCountDown.departureTimeStamp,end:schoolRunCountDown.showCountDownStop, name: OUT_OF_TIME, emoji: 'You are late!', hasProgressBar: false}, [schoolRunCountDown, currentTime]);

    currentTime = date_plus_seconds( departureTime, 19  );
    result += run_unit_test("get_boundary_window_for_school_run", 'OUT_OF_TIME +20 ', compare_with_stringify, {start:schoolRunCountDown.departureTimeStamp,end:schoolRunCountDown.showCountDownStop, name: OUT_OF_TIME, emoji: 'You are late!', hasProgressBar: false}, [schoolRunCountDown, currentTime]);

    currentTime = date_plus_seconds( departureTime, 21  );
    result += run_unit_test("get_boundary_window_for_school_run", 'OUT_OF_TIME +21 ', compare_with_stringify, {}, [schoolRunCountDown, currentTime]);

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
    let date = new Date("2021-12-06T07:00:00.000Z");
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