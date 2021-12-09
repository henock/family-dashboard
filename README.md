# Family dashboard

A simple web based dashboard - making API calls to other systems and displaying the results (weather, our commute and todo list).
 
> **SECURITY NOTE** 
> 
> This is not supposed to be running out on the internet, but instead on a local server running in our kitchen.
>
> This is because your runtime-config.json would expose all of your API keys


### Original Trello board

![Original Trello board](/docs/2021-11-20-trello-board.png)

### Resulting family dashboard

![Original Trello board](/docs/2021-12-09-family-dashboard.jpg)


## Configuration and deployment 

All code is present in the repository, however you will need to provide your own runtime-config.json file (full example [here](/docs/example-runtime-config.json)) which is passed in as a volume see the docker run command below.

What your runtime-config.json needs to look like

```json
{
  "trello": {
    "key": "<your key for http://trellow.com>",
    "token": "<your token for http://trellow.com>",
    "todoListId": "todo",
    "inProgressListId": "in-progress",
    "doneListId": "done"
  },
  "transportApi": {
    "appId": "<your appId for http://transportapi.com here>",
    "appKey": "<your appKey for http://transportapi.com here>"
  },
  "tomorrowIo": {
    "apiKey": "<your api key for http://tomorrow.io>",
    "location": "51.414282,-0.017142"
  },
  "timeZones": [ {
    "id": "America/New_York",
    "name": "DC",
    "flag": "\uD83C\uDDFA\uD83C\uDDF8"
  },
    {
      "id": "Africa/Nairobi",
      "name": "Addis",
      "flag": "\uD83C\uDDEA\uD83C\uDDF9"
    }
  ],
  "schoolRunCountDown": {
    "showCountDownStart": "06:00",
    "showCountDownStop": "07:41",
    "startCountDown": "07:10",
    "getOutOfBedBy": "07:10",
    "finishGettingDressedBy": "07:20",
    "finishBreakfastBy": "07:30",
    "putOnShoesBy": "07:35",
    "departureTime": "07:40",
    "stopCountDown": "07:50"
  },
  "transport": {
    "maximumTrainsToShow": 8,
    "commutes": [
      {
        "from": "Ravensbourne",
        "noNeedToLeaveBefore": 2300,
        "walkTransitTime": 2000,
        "runTransitTime": 1800,
        "driveTransitTime": 800,
        "direction": "to-work",
        "showAllDestinations": true,
        "to": [ "London Cannon Street", "London Bridge", "London Charing Cross" ]
      },
      {
        "from": "New Beckenham",
        "noNeedToLeaveBefore": 2300,
        "walkTransitTime": 2000,
        "runTransitTime": 1800,
        "driveTransitTime": 800,
        "direction": "to-work",
        "showAllDestinations": true,
        "to": [ "London Cannon Street", "London Bridge", "London Charing Cross" ]
      },
      {
        "from": "Beckenham Junction",
        "noNeedToLeaveBefore": 2300,
        "walkTransitTime": 2000,
        "runTransitTime": 1800,
        "driveTransitTime": 800,
        "direction": "to-work",
        "showAllDestinations": true,
        "to": [ "London Cannon Street", "London Bridge", "London Charing Cross" ]
      }
    ]
  }
}
```

# Running the dashboard from a webserver process (python3 example)

```shell
 git clone https://github.com/henock/family-dashboard.git
 cd family-dashboard
 cp docs/example-runtime-config.json website/data/runtime-config.json
 # Register with http://www.trello.com, create a dashboard with todo, In progress, done lists & get an API key
 # Register with http://www.tomrrow.io and get an API key
 # Register with http://www.transportapi.com and get an API key
 # Populate it with the keys in the format shown above
 python3 -m http.server    
```
# Running the dashboard from Docker 
- The version allows for an update to the source repo to be dynamically updated in the dashboard
```shell
 git clone https://github.com/henock/family-dashboard.git # or your clone.
 # Register with http://www.trello.com, create a dashboard with todo, In progress, done lists & get an API key
 # Register with http://www.tomrrow.io and get an API key
 # Register with http://www.transportapi.com and get an API key
 # Create a local file called <project folder>/config/runtime-config.json
 # Populate it with the keys in the format shown above
 docker build -t henock/family-dashboard .  
 docker run -p 8080:80 -v $(pwd)/config/runtime-config.json:/usr/share/nginx/html/family-dashboard/data/runtime-config.json henock/family-dashboard   
``` 

## Running the dashboard

Once you have started docker container locally you open 

| description | link                                                                                         |
| :---        | :---                                                                                         |
| website     | [http://localhost:8080/family-dashboard/](http://localhost:8080/family-dashboard/)           |
| logs        | [http://localhost:8080/family-dashboard/logs/](http://localhost:8080/family-dashboard/logs/) |