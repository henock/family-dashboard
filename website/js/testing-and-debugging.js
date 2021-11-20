

function is_debug_on(){
    return 'true' === get_url_parameter('debug');
}

function get_url_parameter( paramToGet ){
    let searchParams = new URLSearchParams( window.location.search );
    return searchParams.get(paramToGet);
}


/// UNIT TEST RUNNER /////
function run_unit_test( function_under_test, expected_result, parameters, compare_function ){
    var result;
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