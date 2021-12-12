
function update_model_with_weather( model ){
    if( model.data.weather.nextUpdateTime < new Date() ){
        update_model_with_weather_next_five_days(model);
        update_model_with_weather_now_and_future_hour(model);
        model.data.weather.nextUpdateTime = now_plus_seconds( model.runtimeConfig.weather.updateEvery );
    }
}

function update_model_with_weather_now_and_future_hour(model){
    common_get_remote_weather_data( model, '1h', function( model2, response ){
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
    });
    return model;
}

function update_model_with_weather_next_five_days(model){
     common_get_remote_weather_data( model, '1d', function( model2, response ){
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
    });
    return model;
}

function common_get_remote_weather_data( model, timeStep, processResultFunction ){
    let urlToGet = '';
    if(model.config.debugging){
        urlToGet = "test-data/tomorrow-timelines-"+ timeStep +".json"
    } else{
        // 'apikey', '' from junk.henock
        // calls limited to 25/hour, therefore max call every 150 seconds (3600/24=150)
        urlToGet = "https://api.tomorrow.io/v4/timelines"
            + "?location=" + model.runtimeConfig.weather.location
            + "&fields=grassIndex,treeIndex,weatherCode,temperature,temperatureApparent,precipitationProbability,precipitationType,windSpeed,sunriseTime,sunsetTime,humidity"
            + "&units=metric"
            + "&timesteps=" + timeStep
            + "&apikey=" + model.apiKeys.tomorrowIo.apiKey;
    }
    get_remote_data( urlToGet, false, model, processResultFunction );
    return model;
}

