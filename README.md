# Family dashboard

A simple web based dashboard - making API calls to other systems and displaying the results.
 
> **SECURITY NOTE** 
> 
> This is not supposed to be running out on the internet, but instead on a local server running in our kitchen.
>
> This is because your runtime-config.json would expose all of your API keys


### Original Trello board

![Original Trello board](/docs/2021-11-20-trello-board.png)

### Resulting family dashboard

![Original Trello board](/docs/2021-11-20-family-dashboard.png)


## Configuration and deployment 

All code is present in the repository, however you will need to provide your own runtime-config.json files which is passed in as a volume see the docker run command below.

What your runtime-config.json needs to look like

```json
{
  "trello": {
      "key": "<your key for http://trellow.com>",
      "token": "<your token for http://trellow.com>",
      "todoListId": "<your todo list Id from http://trellow.com>",
      "inProgressListId": "<your in progress list Id from http://trellow.com>",
      "doneListId": "<your done list Id from http://trellow.com>"
  },
  "tomorrowIo": {
      "apiKey": "<your api key for http://tomorrow.io>",
      "location": "<the GPS coordinates for which you want to display weather data>"
  },
  "timeZones": {
    "one": {
      "id": "America/New_York",
      "name": "DC"
    },
    "two": {
      "id": "Africa/Nairobi",
      "name": "Addis"
    }
  },
  "schoolRunCountDown": {
    "showCountDown": "07:00",
    "startCountDown": "07:10",
    "finishGettingDressedBy": "07:20",
    "finishBreakfastBy": "07:30",
    "departureTime": "07:40",
    "stopCountDown": "07:50"
  },
  "transport": {
    "maximumTrainsToShow": 8,
    "commutes": [
      {
        "from": "NBC",
        "walkTransitTime": 2000,
        "runTransitTime": 1800,
        "driveTransitTime": 800,
        "direction": "to-work",
        "showAllDestinations": true,
        "to": [ "CST", "LBG", "CHX" ]
      },
      {
        "from": "BKJ",
        "walkTransitTime": 900,
        "runTransitTime": 600,
        "driveTransitTime": 400,
        "direction": "to-work",
        "showAllDestinations": true,
        "to": [ "VIC", "LBG" ]
      },
      {
        "from": "CST",
        "walkTransitTime": 600,
        "runTransitTime": 300,
        "direction": "home",
        "showAllDestinations": false,
        "to": [ "ORP", "HYS" ]
      },
      {
        "from": "LBG",
        "walkTransitTime": 1500,
        "runTransitTime": 800,
        "direction": "home",
        "showAllDestinations": false,
        "to": [ "HYS", "SEV", "ORP", "BKJ" ]
      }
    ]
  }
}
```

# Running the server from Docker 
```shell
 git clone https://github.com/henock/family-dashboard.git
 # Register with http://www.trello.com, create a dashboard with todo, In progress, done lists & get an API key
 # Register with http://www.tomrrow.io and get an API key
 # Create a local file called <project folder>/config/runtime-config.json
 # Populate it with the keys in the format shown above
 docker build -t henock/family-dashboard .  
 docker run -p 8080:80 -v $(pwd)/config/runtime-config.json:/usr/share/nginx/html/family-dashboard/js/runtime-config.json henock/family-dashboard   
``` 

## Running the dashboard

Once you have started docker container locally you open 

| description | link                                                                                         |
| :---        | :---                                                                                         |
| website     | [http://localhost:8080/family-dashboard/](http://localhost:8080/family-dashboard/)           |
| logs        | [http://localhost:8080/family-dashboard/logs/](http://localhost:8080/family-dashboard/logs/) |