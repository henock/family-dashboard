# Family dashboard

A simple web based dashboard - making API calls to other systems and displaying the results (weather, our commutes and todo list).
 
> **SECURITY NOTE** 
> 
> This is not supposed to be running out on the internet, but instead on a local server running in our kitchen.
>
> This is because your runtime-config.json would expose all of your API keys


### Original Trello board

![Original Trello board](/docs/2021-11-20-trello-board.png)

### Resulting family dashboard

![Original Trello board](/docs/2021-12-22-family-dashboard.jpg)


## Configuration and deployment 

All code is present in the repository, however you will need to update the /config/api-keys.json with your own keys, and this is passed in as a volume see the docker run command below.

The api-keys.json file will need to be updated  
```json
{
  "trello": {
    "key": "<your key for http://trellow.com>",
    "token": "<your token for http://trellow.com>"
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


What your runtime-config.json needs to look like

```json
{
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
    "todoListId": "<your todoListId>",
    "updateEvery": "120"
  },
  "timeZones": {
    "show": true,
    "updateEvery": "120",
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
  },
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
        "from": "Beckenham Junction",
        "noNeedToLeaveBefore": "departure-25m",
        "walkTransitTime": "departure-20m",
        "runTransitTime": "departure-15m",
        "driveTransitTime": "departure-10m",
        "direction": "to-work",
        "showAllDestinations": true,
        "to": [
          "London Victoria",
          "London Bridge"
        ]
      },
      {
        "from": "Ravensbourne",
        "noNeedToLeaveBefore": "departure-40m",
        "walkTransitTime": "departure-30m",
        "runTransitTime": "departure-25m",
        "driveTransitTime": "departure-10m",
        "direction": "to-work",
        "showAllDestinations": true,
        "to": [
          "London Blackfriars"
        ]
      }
    ]
  }
}
```

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

| description | link                                                                                         |
| :---        | :---                                                                                         |
| website     | [http://localhost:8080/family-dashboard/](http://localhost:8080/family-dashboard/)           |
| logs        | [http://localhost:8080/family-dashboard/logs/](http://localhost:8080/family-dashboard/logs/) |