
function convert_weather_code_to_text( code ){
    switch(code){
        case 0: return "Unknown";
        case 1000: return  "Clear";
        case 1001: return  "Cloudy";
        case 1100: return  "Mostly Clear";
        case 1101: return  "Partly Cloudy";
        case 1102: return  "Mostly Cloudy";
        case 2000: return  "Fog";
        case 2100: return  "Light Fog";
        case 3000: return  "Light Wind";
        case 3001: return  "Wind";
        case 3002: return  "Strong Wind";
        case 4000: return  "Drizzle";
        case 4001: return  "Rain";
        case 4200: return  "Light Rain";
        case 4201: return  "Heavy Rain";
        case 5000: return  "Snow";
        case 5001: return  "Flurries";
        case 5100: return  "Light Snow";
        case 5101: return  "Heavy Snow";
        case 6000: return  "Freezing Drizzle";
        case 6001: return  "Freezing Rain";
        case 6200: return  "Light Freezing Rain";
        case 6201: return  "Heavy Freezing Rain";
        case 7000: return  "Ice Pellets";
        case 7101: return  "Heavy Ice Pellets";
        case 7102: return  "Light Ice Pellets";
        case 8000: return  "Thunderstorm";
        default: return "Unexpected code: '" + code + "'";
    }
}

function convert_weather_code_to_image( code, isNightTime ){
    switch(code){
        case 1000:  // Clear
        case 1100:  // Mostly Clear
            if(isNightTime){
                return "clear_night_moon.svg"
            } else {
                return "sunny.svg"
            }
        case 1001:  // Cloudy
        case 1101:  // Partly Cloudy
            if(isNightTime){
                return "partly_cloudy_night_moon.svg";
            } else {
                return "partly_cloudy_day_sun_clouds.svg";
            }

        case 1102:  // Mostly Cloudy
            if(isNightTime){
                return "partly_cloudy_night_moon.svg";
            } else {
                return "overcast_cloud.svg";
            }

        case 2100:  // Light Fog
            return "mist.svg";
        case 2000:  // Fog
            return "fog.svg";

        case 3000:  // Light Wind
        case 3001:  // Wind
        case 3002:  // Strong Wind
        case 5001:  // Flurries
            if(isNightTime){
                return "windy_palm_tree_dark.svg";
            } else {
                return "windy_palm_tree.svg";
            }

        case 4000:  // Drizzle
                return "drizzle_rain_snow.svg";

        case 4001:  // Rain
        case 4200:  // Light Rain
            if(isNightTime){
                return "rain_shower_night_moon.svg";
            } else {
                return "rain_day_sun.svg";
            }

        case 4201:  // Heavy Rain
            if(isNightTime){
                return "heavy_rain_night_cloud_moon.svg";
            } else {
                return "heavy_rain_day.svg";
            }

        case 5100:  // Light Snow
        case 5000:  // Snow
            if(isNightTime){
                return "snow_night_moon_cloud_snow.svg";
            } else {
                return "snow_cloud.svg";
            }
        case 5101:  // Heavy Snow
            if(isNightTime){
                return "heavy_snow_night_cloud_moon.svg";
            } else {
                return "heavy_snow_day_sun.svg";
            }
        case 6201:  // Heavy Freezing Rain
        case 6000:  // Freezing Drizzle
        case 6200:  // Light Freezing Rain
        case 6001:  // Freezing Rain
        case 7000:  // Ice Pellets
        case 7101:  // Heavy Ice Pellets
        case 7102:  // Light Ice Pellets
            if(isNightTime){
                return "sleet_night_snow_rain_raining.svg";
            } else {
                return "sleet_day_cloud_sun_rain_snow.svg";
            }
        case 8000:  // Thunderstorm
            if(isNightTime){
                return "thunder_night_cloud_storm_lightning.svg";
            } else {
                return "thunder_day_cloud_thunderbolt_lightning.svg";
            }
        case 0:     // Unknown";
        default:    // Unexpected code
            return "system_unknown.png"
    }
}


function show_all_weather(){
    if( familyDashboard.config.showWeather ){
        get_and_set_weather_for_upcoming_days();
        get_and_set_weather_for_upcoming_hours();
    }
}

function set_weather_details( keyString, dateString, temperatureString, weather_code, grassIndex, treeIndex ){
    $("#weather-date-" + keyString ).html(  dateString );
    $("#weather-temp-" + keyString ).html(  temperatureString );
    $("#weather-grassIndex-" + keyString ).html(  grassIndex  );
    $("#weather-treeIndex-" + keyString ).html(  treeIndex );
    $("#weather-image-" + keyString ).attr(  "src", "img/weather-icons/" + convert_weather_code_to_image( weather_code ) );
    $("#weather-text-" + keyString ).html( convert_weather_code_to_text( weather_code ));
}

function set_weather_details_for_days( today, keyString ){
    let dateString = new Date(today.startTime).toLocaleString('default', { month: 'short', day: '2-digit' , weekday: 'short'});
    let temperatureString = Math.round( today.values.temperatureApparent ) + DEGREES_CELSIUS;
    set_weather_details( keyString, dateString, temperatureString, today.values.weatherCode, today.values.grassIndex, today.values.treeIndex );
}

function set_weather_for_upcoming_days( result ){
    let today = result.data.timelines[0].intervals[0];
    $("#sun-rise-time").html( new Date( today.values.sunriseTime).toLocaleString().substring(11,17));
    $("#sun-set-time").html( new Date( today.values.sunsetTime).toLocaleString().substring(11,17));
    $("#current-weather").html("");
    for (var i = 1; i < 6; i++) {
        set_weather_details_for_days( result.data.timelines[0].intervals[i], 'day-' + i );
    }
}

function get_and_set_weather_for_upcoming_days(){
    let tomorrowIoConfig = familyDashboard.runtimeConfig.apiKeys.tomorrowIo;
    let urlToGet = '';
    if( is_debug_on()){
        urlToGet = "test-data/tomorrow-timelines-1d.json"
    } else{
        // 'apikey', '' from junk.henock
        // calls limited to 25/hour, therefore max call every 150 seconds (3600/24=150)
        urlToGet = "https://api.tomorrow.io/v4/timelines"
            + "?location=" + familyDashboard.runtimeConfig.weather.location
            + "&fields=grassIndex,treeIndex,weatherCode,temperature,temperatureApparent,precipitationProbability,precipitationType,windSpeed,sunriseTime,sunsetTime,humidity"
            + "&units=metric"
            + "&timesteps=1d"
            + "&apikey=" + tomorrowIoConfig.apiKey;
    }

    $.ajax({
        url: urlToGet,
        type: "GET",
        success: set_weather_for_upcoming_days,
        error: function ( xhr ){
            log_error( xhr.status +' Error calling Climacell for days ('+xhr.responseText +').');
        }
    });
}

function set_weather_for_upcoming_hours( daily ){
    let now = daily.data.timelines[0].intervals[0];
    let inSixHours = daily.data.timelines[0].intervals[5];

    set_weather_details( 'now', now.startTime.substring(11,16),
                        now.values.temperatureApparent  + DEGREES_CELSIUS,
                        now.values.weatherCode,
                        now.values.grassIndex,
                        now.values.treeIndex);

    set_weather_details( 'plus-6hrs', inSixHours.startTime.substring(11,16),
                        inSixHours.values.temperatureApparent  + DEGREES_CELSIUS,
                        inSixHours.values.weatherCode ,
                        inSixHours.values.grassIndex,
                        inSixHours.values.treeIndex);

}

function get_and_set_weather_for_upcoming_hours( interval_in_seconds ){
    let tomorrowIoConfig = familyDashboard.runtimeConfig.apiKeys.tomorrowIo;
    let urlToGet = '';
    if( is_debug_on()){
        urlToGet = "test-data/tomorrow-timelines-1h.json"
    } else{
        // 'apikey', from junk.henock
        // calls limited to 25/hour, therefore max call every 150 seconds (3600/24=150)
        urlToGet = "https://api.tomorrow.io/v4/timelines"
            + "?location=" + familyDashboard.runtimeConfig.weather.location
            + "&fields=grassIndex,treeIndex,weatherCode,temperature,temperatureApparent,precipitationProbability,precipitationType,windSpeed,humidity"
            + "&units=metric"
            + "&timesteps=1h"
            + "&apikey=" + tomorrowIoConfig.apiKey;
    }

    $.ajax({
        url: urlToGet,
        type: "GET",
        success: set_weather_for_upcoming_hours,
        error: function ( xhr ){
            if( xhr ){
                log_error( xhr.status +' Error calling Climacell for days ('+xhr.responseText +').');
            } else{
                log_error( ' Error calling Climacell for days ( Unknown error ).');
            }
        }
    });

    set_refresh_values( "#weather-update", interval_in_seconds );
}
