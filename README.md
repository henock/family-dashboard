# Family dashboard

A simple browser only based dashboard, that gathers remote data via API calls out to three external websites and displays the results on a monitor in our kitchen.

## Full dashboard.
![Family Dashboard](/docs/2021-12-23-family-dashboard.jpg)

## Train times count down explained.
![Count down explained](/docs/2021-12-23-train-countdown-explained.jpg)

## Configuration and deployment 

The dashboard is configured via two configuration files

| Name                | Description                                                                               |
|:--------------------|:------------------------------------------------------------------------------------------|
| api-keys.json       | Which stores you api keys to connect to the remote api endpoints called to download data. | 
| runtime-config.json | Which configures how and what the dashboard displays.                                     | 
 

### api-keys.json  
You will need to sign up and get Api keys and token from the remote websites that provide this data.  


> **SECURITY NOTE**
>
> This is not supposed to be running out on the internet, but instead on a local server running in our kitchen.
>
> This is because your /data/api-keys.json would expose all of your API keys



- [http://transportapi.com](https://developer.transportapi.com/signup) - to get data on train departure times.
- [http://tomorrow.io](https://app.tomorrow.io/signup) - to get data on weather forecasts for a GPS coordinate.
- [http://trello.com](https://trello.com/signup) - to get data on a todo or tasks list (we maintain the task list via the trello mobile app )


```json
{
  "trello": {
    "key": "<your key for http://trello.com>", 
    "token": "<your token for http://trello.com>" 
  },
  "transportApi": {
    "appId": "<your appId for http://transportapi.com here>",
    "appKey": "<your appKey for http://transportapi.com here>"
  },
  "tomorrowIo": {
    "apiKey": "<your api key for http://tomorrow.io>"
  }
}
```


### runtime-config.json

What your /data/runtime-config.json is used to configure what your dashboard will display and how it behaves.

The first section configures whether a section (ie trains/weather etc.) is working or not.

```json
...  

  "trains": {
    "show": true,
    "updateEvery": "600"
  },
    "weather": {
    "show": true,
    "showFutureHour": 6,
    "location": "<your gps coordinates>",
    "updateEvery": "1800"
  },
    "tasks": {
    "show": true,
    "todoListId": "<your todoListId from http://trello.com>",
    "updateEvery": "120"
  }

...
``` 

| Name                   | Description                                                                                                        | Possible values |
|:-----------------------|:-------------------------------------------------------------------------------------------------------------------|----------------:|
| *.show                 | Configures if the train departures section is on                                                                   |   true or false |
| *.updateEvery          | How often to in seconds to call the respective api for new data. <br/>*Note*:You should not exceed the rate limit. |                 |
| weather.showFutureHour | Today's weather is shown as it is now and this number of hours in the future.                                      |            1-23 |
| weather.location       | The GPS coordinates for the location for which you want to see the weather, sunrise and sunset times.              |                 |
| task.todoListId        | The Id of your trello do list.                                                                                     |                 |


```json
 ...

  "timeZones": {
    "show": true,
    "zones": [
      {
        "id": "America/New_York",
        "name": "DC",
        "flag": "\uD83C\uDDFA\uD83C\uDDF8"
      },
      {
        "id": "Africa/Nairobi",
        "name": "Addis",
        "flag": "\uD83C\uDDEA\uD83C\uDDF9"
      }
    ]
  },

...
```
### Note: you can only have up to four timezone times showing.

| Name | Description                                                                                                                                     | Possible values / Examples |
|:-----|:------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------:|
| show | Configures if the different time zone clocks are shown                                                                                          |              true OR false |
| id   | The international time zone id you want to display <br/> [this](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) is the full list. |           "Africa/Nairobi" |
| name | The name you would like displayed                                                                                                               |              Addis / Mum   |
| flag | The flag emoji you would like displayed [here](https://emojipedia.org/flags/) is the full list.                                                 | "\uD83C\uDDEA\uD83C\uDDF9" | 


```json
 ...

  "schoolRunCountDown": {
    "show": true,
    "showCountDownStart": "departure-50m",
    "startCountDown": "departure-45m",
    "getOutOfBedBy": "departure-40m",
    "finishGettingDressedBy": "departure-30m",
    "finishBreakfastBy": "departure-20m",
    "putOnShoesBy": "departure-10m",
    "departureTime": "07:40",
    "stopCountDown": "departure+1m",
    "showCountDownStop": "departure+1m"
  }

...

```
| Name                   | Description                                                                                                 |                          Possible values / Examples |
|:-----------------------|:------------------------------------------------------------------------------------------------------------|----------------------------------------------------:|
| show                   | Configures if the school run countdown is shown                                                             |                                       true OR false |
| showCountDownStart     | When the countdown should become visible.                                                                   |  hours, minutes, seconds relative to departure time |
| startCountDown         | When the count down should start.                                                                           |  hours, minutes, seconds relative to departure time |
| getOutOfBedBy          | The time by which the kids need to be out of bed.                                                           |  hours, minutes, seconds relative to departure time |
 | finishGettingDressedBy | The time by which the kigs should be dressed by.                                                            |  hours, minutes, seconds relative to departure time |
| finishBreakfastBy      | The time by which the kids should have finished breakfast by.                                               |  hours, minutes, seconds relative to departure time |
| putOnShoesBy           | The time by which the kids should have put on their shoes.                                                  |  hours, minutes, seconds relative to departure time |
| departureTime          | The time by which the kids need to be out of the door <br/>*Note* All other times are relative to this one. |  hours, minutes, seconds relative to departure time |
| stopCountDown          | The time at which the countdown stops.                                                                      |  hours, minutes, seconds relative to departure time |
| showCountDownStop      | The time after which the coutdown is not visible.                                                           |  hours, minutes, seconds relative to departure time |


```json
 ...

  "transport": {
    "maximumTrainsToShow": 8,
    "commute": [
      {
        "from": "New Beckenham",
        "noNeedToLeaveBefore": "departure-40m",
        "walkTransitTime": "departure-30m",
        "runTransitTime": "departure-25m",
        "driveTransitTime": "departure-15m",
        "direction": "to-work",
        "showAllDestinations": true,
        "to": [
          "London Cannon Street",
          "London Charing Cross",
          "London Bridge"
        ]
      },
      {
        ..other departure stations..
      }
    ]
  }

...
```

| Name                | Description                                                                                                                                                                                                                                      |                                            Possible values / Examples |
|:--------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------:|
| maximumTrainsToShow | The maximum number of trains to show into the future                                                                                                                                                                                             |                                                                     5 |
| from                | Your departure station                                                                                                                                                                                                                           |                                Must be a station in staion-codes.json |
| noNeedToLeaveBefore | The time before which you have no need to leave                                                                                                                                                                                                  | hours, minutes, seconds relative to <br/> departure time of the train |
| walkTransitTime     | The window you can comfortably walk to the station                                                                                                                                                                                               | hours, minutes, seconds relative to <br/> departure time of the train |
| runTransitTime      | The window of time within which you can run to the station                                                                                                                                                                                       | hours, minutes, seconds relative to <br/> departure time of the train |
| driveTransitTime    | The window of time within which you can drive to the station                                                                                                                                                                                     | hours, minutes, seconds relative to <br/> departure time of the train |
| direction           | The direction of travel to/from work                                                                                                                                                                                                             |                                                    to-work OR to-home |
| showAllDestinations | Show all destination leaving the station or only destinations in the to list<br/> if its a mainline station this could mean that <br/> the destinations you are interested in dont show for very long withing the walk/run/drive transit windows |                                                         true OR false |
| to                  | The list of destination stations that you are interested in                                                                                                                                                                                      |                                Must be a station in staion-codes.json |

# Running the dashboard from a webserver process (python3 example)

Note: Any changes to the remote repo will not be automatically updated locally

```shell
 git clone https://github.com/henock/family-dashboard.git
 cd family-dashboard
 # Register with http://www.trello.com, create a dashboard with todo, In progress, done lists & get an API key
 # Register with http://www.tomrrow.io and get an API key
 # Register with http://www.transportapi.com and get an API key
 # Populate /website/data/api-kyes.json with the keys in the format shown above
 python3 -m http.server    
```

| description | link                                                             |
|:------------|:-----------------------------------------------------------------|
| website     | [http://localhost:8000/website/](http://localhost:8000/website/) |

# Running the dashboard from Docker 
- The version allows for an update to the source repo to be dynamically updated in the dashboard
```shell
 git clone https://github.com/henock/family-dashboard.git # or your clone.
 cd family-dashboard
 # Register with http://www.trello.com, create a dashboard with todo, In progress, done lists & get an API key
 # Register with http://www.tomrrow.io and get an API key
 # Register with http://www.transportapi.com and get an API key
 # Populate /website/data/api-kyes.json with the keys in the format shown above
docker build -t henock/family-dashboard .
docker run -p 8080:80 -v $(pwd)/config/runtime-config.json:/usr/share/nginx/html/family-dashboard/data/runtime-config.json henock/family-dashboard
``` 
If you are using docker to run the dashboard it will check the github repository for changes and download them.
It logs this behaviour in a 10 day rolling logs files (see below)

| description | link                                                                                          |
|:------------|:----------------------------------------------------------------------------------------------|
| website     | [http://localhost:8080/family-dashboard/](http://localhost:8080/family-dashboard/)            |
| logs        | [http://localhost:8080/family-dashboard/logs/](http://localhost:8080/family-dashboard/logs/)  |