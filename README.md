# Family dashboard

A simple web based dashboard - making API calls to other systems and displaying the results.
 
> NOTE: This is not supposed to be running out on the internet, but instead on a local server running in our kitchen


All code is present but you will need to provide your own runtime-config.json files which is passed in as a volume see the docker run command below.

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
        "location": "<the GPS location for which you want to display weather data>"
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
    }
}
```

# Running from Docker 
```shell
 docker build -t henock/family-dashboard .  
 docker run -p 8080:80 -v $(pwd)/config/runtime-config.json:/usr/share/nginx/html/family-dashboard/js/runtime-config.json henock/family-dashboard   
``` 

## Running the dashboard

Once you have started docker container locally you open 

| description | link                                                                                         |
| :---        | :---                                                                                         |
| website     | [http://localhost:8080/family-dashboard/](http://localhost:8080/family-dashboard/)           |
| logs        | [http://localhost:8080/family-dashboard/logs/](http://localhost:8080/family-dashboard/logs/) |