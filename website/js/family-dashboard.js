
function set_refresh_values( refresh_type_element_id, intervalInSeconds){
    if( intervalInSeconds ){
        $(refresh_type_element_id).attr( "refresh-period-in-seconds", intervalInSeconds );
    } else {
        intervalInSeconds = $(refresh_type_element_id).attr( "refresh-period-in-seconds" );
    }

    var nextRefreshTime = new Date(now_plus_seconds( intervalInSeconds ));
    $(refresh_type_element_id).attr( "next-refresh-time", nextRefreshTime );
}

function call_function_then_set_on_interval_seconds( functionToCall, intervalInSeconds ){
    call_function_then_set_on_interval_milli_seconds( functionToCall, intervalInSeconds * 1000 )
}

function call_function_then_set_on_interval_milli_seconds( functionToCall, intervalInMillis ){
    functionToCall(intervalInMillis / 1000 );
    setInterval( functionToCall,  intervalInMillis  );
}

function run_function_by_the_milli_second(){
    update_all_count_down_times();
}

function run_function_by_the_second(){
    set_date_and_time();
    remove_overdue_messages();
    show_or_hide_school_run_departure_time();
}


function run_function_by_the_minute(){
    let timeZones = get_runtime_config().timeZones;
    set_date_time_for_time_zone( timeZones.one.id, timeZones.one.name, "#time-zone-1" )
    set_date_time_for_time_zone( timeZones.two.id, timeZones.two.name, "#time-zone-2" )
}


function check_runtime_config_present(){
    let runtimeConfig = get_runtime_config();
    if( runtimeConfig ){
        console.log( 'Runtime config is being read fine: ' + runtimeConfig  );
        return true;
    }else{
        console.log( 'ERROR --- Runtime config is being as expected: ' + runtimeConfig  );
        return false;
    }
}

$(document).ready(function(){
    if(check_runtime_config_present()){
        call_function_then_set_on_interval_seconds( set_train_arrivals, 600 );
        call_function_then_set_on_interval_seconds( get_and_set_weather_for_upcoming_hours, 600 );
        call_function_then_set_on_interval_seconds( get_and_set_weather_for_upcoming_days, 600 );
        call_function_then_set_on_interval_seconds( set_todo_tasks, 120 );
    } else {
        log_error( "Could not get the runtime-config.json");
    }
    call_function_then_set_on_interval_seconds( run_function_by_the_second, 1 );
    call_function_then_set_on_interval_seconds( run_function_by_the_minute, 60 );
    call_function_then_set_on_interval_milli_seconds( run_function_by_the_milli_second, 1 );
});

