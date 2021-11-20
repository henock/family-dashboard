# Family dashboard
A simple web based dashboard - making API calls to other system and displaying the results.


# Running from Docker
```shell
 docker build -t henock/family-dashboard .  
 docker run -p 8080:80 -v $(pwd)/config/runtime-config.js:/usr/share/nginx/html/family-dashboard/js/runtime-config.js henock/family-dashboard   
``` 
