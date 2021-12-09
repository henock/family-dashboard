let familyDashboard = {
    runtimeConfig : undefined,
    config : {
        timeZone: true,
        showSchoolRunCountdown: true,
        weather: true,
        travel: true,
        tasks: true
    }
}

function set_refresh_values(refresh_type_element_id, intervalInSeconds) {
    if (intervalInSeconds) {
        $(refresh_type_element_id).attr("refresh-period-in-seconds", intervalInSeconds);
    } else {
        intervalInSeconds = $(refresh_type_element_id).attr("refresh-period-in-seconds");
    }

    let nextRefreshTime = new Date(now_plus_seconds(intervalInSeconds));
    $(refresh_type_element_id).attr("next-refresh-time", nextRefreshTime);
}

function call_function_then_set_on_interval_seconds(functionToCall, intervalInSeconds) {
    call_function_then_set_on_interval_milli_seconds(functionToCall, intervalInSeconds * 1000)
}

function call_function_then_set_on_interval_milli_seconds(functionToCall, intervalInMillis) {
    functionToCall(intervalInMillis / 1000);
    setInterval(functionToCall, intervalInMillis);
}

function run_function_every_100_milli_seconds() {
    set_date_and_time();
    update_all_count_down_times();
    remove_overdue_messages();
}

function check_runtime_config_present() {
    familyDashboard.runtimeConfig = get_runtime_config();
    if (familyDashboard.runtimeConfig) {
        console.log('Runtime config is being read fine: ' + familyDashboard.runtimeConfig);
        return true;
    } else {
        console.log('ERROR --- Runtime config is missing: ' + familyDashboard.runtimeConfig);
        return false;
    }
}

function switch_off_everything(){
    familyDashboard.config.timeZones = false;
    familyDashboard.config.showSchoolRunCountdown = false;
    familyDashboard.config.weather = false;
    familyDashboard.config.travel = false;
    familyDashboard.config.tasks = false;
}

function switch_on_everything(){
    familyDashboard.config.timeZones = true;
    familyDashboard.config.showSchoolRunCountdown = true;
    familyDashboard.config.weather = true;
    familyDashboard.config.travel = true;
    familyDashboard.config.tasks = true;
}

function hide_everything(){
    $("#dashboard-main").addClass('d-none');
    $("#date-time-messages").addClass('d-none');
    $("#school-run").addClass('d-none');
    $("#weather").addClass('d-none');
    $("#travel").addClass('d-none');
    $("#tasks").addClass('d-none');
}

$(document).ready(function () {
    //todo tidy up
    if(running_unit_tests()){
        run_all_unit_tests();
        $("#main-container").removeClass( "border" );
    }else{
        if (!check_runtime_config_present()) {
            $("#dynamic-runtime-config").removeClass('d-none');
            switch_off_everything();
            log_info("Could not get the runtime-config.json.", 10);
        }else{
            $("#dashboard-main").removeClass('d-none');
            switch_on_everything();
        }

        call_function_then_set_on_interval_seconds(set_todo_tasks, 120);
        call_function_then_set_on_interval_seconds(set_train_arrivals, 600);
        call_function_then_set_on_interval_seconds(update_times_in_different_timezone, 60);
        call_function_then_set_on_interval_seconds(show_or_hide_school_run_departure_time, 1);
        call_function_then_set_on_interval_seconds(get_and_set_weather_for_upcoming_days, 600);
        call_function_then_set_on_interval_seconds(get_and_set_weather_for_upcoming_hours, 600);
        call_function_then_set_on_interval_milli_seconds(run_function_every_100_milli_seconds, 100);
    }
});

