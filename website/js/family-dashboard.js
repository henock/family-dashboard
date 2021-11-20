const DEGREES_CELSIUS 		= ' &#176;C ';
const WALK_GLYPH      		= ' &#128694; ';
const RUN_GLYPH       		= ' &#127939; ';
const BUS_GLYPH 	  		= ' &#128652; ';
const TRAIN_GLYPH     		= ' &#128646; ';
const SPACE_CHARACTER 		= '&nbsp;';
const A_MINUTE				=  60;
const FIVE_MINUTES 			= A_MINUTE * 5
const TEN_MINUTES 			= A_MINUTE * 10
const FIFTEEN_MINUTES		= A_MINUTE * 15
const HALF_AN_HOUR 			= A_MINUTE * 30
const AN_HOUR				= A_MINUTE * 60;
const TWELVE_HOURS			= AN_HOUR * 12;
const TWENTY_FOUR_HOURS		= AN_HOUR * 24;

function set_refresh_values( refresh_type_element_id, interval_in_seconds){
    if( interval_in_seconds ){
        $(refresh_type_element_id).attr( "refresh-period-in-seconds", interval_in_seconds );
    } else {
        interval_in_seconds = $(refresh_type_element_id).attr( "refresh-period-in-seconds" );
    }

    var nextRefreshTime = new Date(now_plus_seconds( interval_in_seconds ));
    $(refresh_type_element_id).attr( "next-refresh-time", nextRefreshTime );
}

function call_function_then_set_on_interval_seconds( functionToCall, interval_in_seconds ){
    call_function_then_set_on_interval_milli_seconds( functionToCall, interval_in_seconds * 1000 )
}

function call_function_then_set_on_interval_milli_seconds( functionToCall, interval_in_millis ){
    functionToCall(interval_in_millis / 1000 );
    setInterval( functionToCall,  interval_in_millis  );
}
function run_function_by_the_milli_second(){
    update_all_count_down_times();
}

function run_function_by_the_second(){
    set_date_and_time();
    remove_overdue_messages();
}


function run_function_by_the_minute( interval_in_seconds ){
    let timeZones = get_runtime_config().timeZones;
    set_date_time_for_time_zone( timeZones.one.id, timeZones.one.name, "#time-zone-1" )
    set_date_time_for_time_zone( timeZones.two.id, timeZones.two.name, "#time-zone-2" )
}


function check_secrets_file_is_present(){
    let runtimeConfig = get_runtime_config();
    if( runtimeConfig){
        console.log( 'Runtime config is being read fine: ' + runtimeConfig  );
    }else{
        console.log( 'ERROR --- Runtime config is being as expected: ' + runtimeConfig  );
    }
}

$(document).ready(function(){
    check_secrets_file_is_present();
    call_function_then_set_on_interval_seconds( run_function_by_the_second, 1 );
    call_function_then_set_on_interval_seconds( run_function_by_the_minute, 60 );
    call_function_then_set_on_interval_milli_seconds( run_function_by_the_milli_second, 1 );
    call_function_then_set_on_interval_seconds( get_and_set_weather_for_upcoming_hours, 600 );
    call_function_then_set_on_interval_seconds( get_and_set_weather_for_upcoming_days, 600 );
    call_function_then_set_on_interval_seconds( set_todo_tasks, 120 );
});

