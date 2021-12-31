

function update_model_with_weather( model, date ){
    if( model.config.showWeather && model.data.weather.nextDownloadDataTime < date ){
        update_model_with_weather_next_five_days(model);
        update_model_with_weather_now_and_future_hour(model);
        model.data.weather.nextDownloadDataTime = now_plus_seconds( model.runtimeConfig.weather.updateEvery );
        model.data.weather.lastUpdatedTime = new Date();
    }
}

function update_weather_ui( model, now ){
    if( model.config.showWeather && ( model.data.weather.todaysDataDownloaded || model.data.weather.futureDataDownloaded )){
        if( model.data.weather.nextRebuildUiTime < now ){
            set_weather_for_upcoming_days( model );
            set_weather_for_today( model );
            if( model.data.weather.todaysDataDownloaded && model.data.weather.futureDataDownloaded ){
                model.data.weather.nextRebuildUiTime = now_plus_seconds( model.runtimeConfig.weather.updateEvery );
            }
        }
        let countDown = generate_next_download_count_down_values( model.data.weather.nextDownloadDataTime, model.runtimeConfig.weather.updateEvery );
        set_next_download_count_down_elements( "weather-update", countDown );
        $(".weather-element").removeClass("d-none");
    } else{
        $(".weather-element").addClass("d-none");
        write_to_console( 'weather.todaysDataDownloaded=' + model.data.weather.todaysDataDownloaded +
                            ' weather.futureDataDownloaded=' + model.data.weather.futureDataDownloaded );
    }
}

function set_weather_for_upcoming_days( model ){
    if( model.data.weather.futureDataDownloaded ){
        $("#current-weather").html("");
        for (var i = 0; i < 5; i++) {
            set_weather_details( 'day-' + i, model.data.weather.futureDays[i],  );
        }
    }else{
        write_to_console( 'weather.futureDataDownloaded=false' );
    }
}

function set_weather_for_today( model ){
    if( model.data.weather.todaysDataDownloaded ){
        $("#sun-rise-time").html(  model.data.weather.today.sunrise );
        $("#sun-set-time").html(  model.data.weather.today.sunset );
        set_weather_details( 'now', model.data.weather.today.now );
        set_weather_details( 'plus-Xhrs', model.data.weather.today.futureHour );
    }else{
        write_to_console( 'weather.todaysDataDownloaded=false' );
    }
}

function set_weather_details( keyString, day ){
    $("#weather-date-" + keyString ).html( day.dateString );
    $("#weather-temp-" + keyString ).html( day.temperature );
    $("#weather-grassIndex-" + keyString ).html( day.grassIndex  );
    $("#weather-treeIndex-" + keyString ).html( day.treeIndex );
    $("#weather-image-" + keyString ).attr(  "src", "img/weather-icons/" + convert_weather_code_to_image( day.weatherCode ));
    $("#weather-text-" + keyString ).html( convert_weather_code_to_text( day.weatherCode ));
}

function update_model_with_weather_now_and_future_hour( model ){
    common_get_remote_weather_data( model, '1h'
    , function( model2, response ){
        let futureHour = model2.runtimeConfig.weather.showFutureHour;
        let now = response.data.timelines[0].intervals[0];
        let inFutureHours = response.data.timelines[0].intervals[futureHour];

        model2.data.weather.today.now = {
            name: 'now',
            dateString : now.startTime.substring(11,16),
            temperature: now.values.temperatureApparent  + DEGREES_CELSIUS,
            grassIndex : now.values.grassIndex,
            treeIndex  : now.values.treeIndex,
            weatherCode: now.values.weatherCode
        };

        model2.data.weather.today.futureHour = {
            name: 'plus-'+ futureHour +'hrs',
            dateString : inFutureHours.startTime.substring(11,16),
            temperature: inFutureHours.values.temperatureApparent  + DEGREES_CELSIUS,
            grassIndex : inFutureHours.values.grassIndex,
            treeIndex  : inFutureHours.values.treeIndex,
            weatherCode: inFutureHours.values.weatherCode
        };
        model2.data.weather.todaysDataDownloaded =  true;
        write_to_console( 'model2.data.weather.todaysDataDownloaded=true' );
    }, function( model2, xhr, default_process_error ){
        default_process_error( xhr );
    });
}

function update_model_with_weather_next_five_days(model){
     common_get_remote_weather_data( model, '1d'
     , function( model2, response ){
        let today = response.data.timelines[0].intervals[0];
        model2.data.weather.today.sunrise = new Date( today.values.sunriseTime).toLocaleString().substring(11,17);
        model2.data.weather.today.sunset  = new Date( today.values.sunsetTime).toLocaleString().substring(11,17);
        for (var i = 1; i < 6; i++) {
            let futureDay = response.data.timelines[0].intervals[i];
            let dateString = new Date(futureDay.startTime).toLocaleString('default', { month: 'short', day: '2-digit' , weekday: 'short'});
            let temperature = Math.round( futureDay.values.temperatureApparent ) + DEGREES_CELSIUS;
            let day = {
                index: i,
                dateString : dateString,
                temperature: temperature,
                grassIndex : futureDay.values.grassIndex,
                treeIndex  : futureDay.values.treeIndex,
                weatherCode: futureDay.values.weatherCode
            }
            model2.data.weather.futureDays.push( day );
        }
        model2.data.weather.futureDataDownloaded = true;
        write_to_console( 'model2.data.weather.futureDataDownloaded=true' );
    }, function( model2, xhr, default_process_error ){
        default_process_error( xhr );
    });
}

function common_get_remote_weather_data( model, timeStep, process_result_function, process_error_function ){
    let urlToGet = '';
    let callAsync = model.config.callAsync;
    if(model.config.debugging){
        urlToGet = "test-data/tomorrow-timelines-"+ timeStep +".json";
    } else{
        // 'apikey', '' from junk.henock
        // calls limited to 25/hour, therefore max call every 150 seconds (3600/24=150)

        let fields = '';
        if( timeStep === '1h'){
            fields = "&fields=grassIndex,treeIndex,weatherCode,temperature,temperatureApparent,precipitationProbability,precipitationType,windSpeed,humidity";
        } else {
            fields = "&fields=grassIndex,treeIndex,weatherCode,temperature,temperatureApparent,precipitationProbability,precipitationType,windSpeed,sunriseTime,sunsetTime,humidity";
        }


        urlToGet = "https://api.tomorrow.io/v4/timelines"
            + "?location=" + model.runtimeConfig.weather.location
            + fields
            + "&units=metric"
            + "&timesteps=" + timeStep
            + "&apikey=" + model.apiKeys.tomorrowIo.apiKey;
    }
    get_remote_data( urlToGet, callAsync, model, process_result_function, process_error_function );
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
