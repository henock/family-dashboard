

function running_unit_tests(){ return false; }

function is_debug_on(){
    return 'true' === get_url_parameter('debug');
}

function get_url_parameter( paramToGet ){
    let searchParams = new URLSearchParams( window.location.search );
    return searchParams.get(paramToGet);
}


/// UNIT TEST RUNNER /////
function run_unit_test( function_under_test, expected_result, parameters, compare_function ){
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

    function add_row( field_name, value ){
        return "<tr><td>" + field_name + "</td><td>: '" + value + "'</td></tr>"
    }

    if( compare_function( result , expected_result )){
        log_error( 'Test failed. <table>'
                    + add_row( 'function',  function_under_test )
                    + add_row( 'expected',  expected_result )
                    + add_row( 'actual',  result )
                    + add_row( 'params',  parameters )
                    + '</table>' );
    }
}

function run_all_unit_tests(){
    unit_test_calculate_departure_date_time_from_time_only_value();
}


function unit_test_calculate_departure_date_time_from_time_only_value(){
    let testTime = new Date("2020-04-26T23:30:00.000");

    let timeAsString = ['23:00','00:00','01:00'];

    let expected = [ new Date('Sun Apr 26 2020 23:00:00 GMT+0100 (BST)'),
                     new Date('Sun Apr 27 2020 00:00:00 GMT+0100 (BST)'),
                     new Date('Sun Apr 27 2020 01:00:00 GMT+0100 (BST)')]

    let compare_function = function(a,b){return a.getTime() != b.getTime()};

    run_unit_test( "calculate_departure_date_time_from_time_only_value", expected[0], [timeAsString[0], testTime], compare_function );

//    for (var i = 0; i < timeAsString.length; i++) {
//        var params = [timeAsString[i], testTime];
//        run_unit_test( "calculate_departure_date_time_from_time_only_value"
//                        ,expected[i]
//                        ,params
//                        ,function(a,b){return a.getTime() != b.getTime();}
//                    );
//    }

}
