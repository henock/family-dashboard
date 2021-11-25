function convert_weather_code_to_css_class( code ){
    switch(code){
        case 0: return "unknown";
        case 1000: return  "clear";
        case 1001: return  "cloudy";
        case 1100: return  "mostly_clear";
        case 1101: return  "partly_cloudy";
        case 1102: return  "mostly_cloudy";
        case 2000: return  "fog";
        case 2100: return  "light_fog";
        case 3000: return  "light_wind";
        case 3001: return  "wind";
        case 3002: return  "strong_wind";
        case 4000: return  "drizzle";
        case 4001: return  "rain";
        case 4200: return  "light_rain";
        case 4201: return  "heavy_rain";
        case 5000: return  "snow";
        case 5001: return  "flurries";
        case 5100: return  "light_snow";
        case 5101: return  "heavy_snow";
        case 6000: return  "freezing_drizzle";
        case 6001: return  "freezing_rain";
        case 6200: return  "light_freezing_rain";
        case 6201: return  "heavy_freezing_rain";
        case 7000: return  "ice_pellets";
        case 7101: return  "heavy_ice_pellets";
        case 7102: return  "light_ice_pellets";
        case 8000: return  "thunderstorm";
        default:
            console.log( 'error', "Unexpected code: '" + code + "'" )
            return "unexpected_code";
    }
}

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

function set_weather_details( keyString, dateString, temperatureString, weather_code, grassIndex, treeIndex ){
    $("#weather-date-" + keyString ).html(  dateString );
    $("#weather-temp-" + keyString ).html(  temperatureString );
    $("#weather-grassIndex-" + keyString ).html(  grassIndex  );
    $("#weather-treeIndex-" + keyString ).html(  treeIndex );
    $("#weather-image-" + keyString ).removeClass().addClass(  convert_weather_code_to_css_class( weather_code ));
    $("#weather-text-" + keyString ).html( convert_weather_code_to_text( weather_code ));
}

function set_weather_details_for_days( today, keyString ){
    var dateString = new Date(today.startTime).toLocaleString('default', { month: 'short', day: '2-digit' , weekday: 'short'});
    var temperatureString = Math.round( today.values.temperatureApparent ) + DEGREES_CELSIUS;
    set_weather_details( keyString, dateString, temperatureString, today.values.weatherCode, today.values.grassIndex, today.values.treeIndex );
}

function set_weather_for_upcoming_days( result ){
    let today = result.data.timelines[0].intervals[0];
    $("#weather-text-sun-rise").html( new Date( today.values.sunriseTime).toLocaleString().substring(11,17));
    $("#weather-text-sun-set").html( new Date( today.values.sunsetTime).toLocaleString().substring(11,17));
    $("#current-weather").html("");
    for (var i = 1; i < 6; i++) {
        set_weather_details_for_days( result.data.timelines[0].intervals[i], 'day-' + i );
    }
}

function get_and_set_weather_for_upcoming_days(){
    if( familyDashboard.config.weather ){
        let tomorrowIoConfig = familyDashboard.runtimeConfig.tomorrowIo;
        let urlToGet = '';
        if( is_debug_on()){
            urlToGet = "test-data/tomorrow-timelines-1d.json"
        } else{
            // 'apikey', '' from junk.henock
            // calls limited to 25/hour, therefore max call every 150 seconds (3600/24=150)
            urlToGet = "https://api.tomorrow.io/v4/timelines"
                + "?location=" + tomorrowIoConfig.location
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
    if( familyDashboard.config.weather ){
        let tomorrowIoConfig = familyDashboard.runtimeConfig.tomorrowIo;
        let urlToGet = '';
        if( is_debug_on()){
            urlToGet = "test-data/tomorrow-timelines-1h.json"
        } else{
            // 'apikey', from junk.henock
            // calls limited to 25/hour, therefore max call every 150 seconds (3600/24=150)
            urlToGet = "https://api.tomorrow.io/v4/timelines"
                + "?location=" + tomorrowIoConfig.location
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
}
