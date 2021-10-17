# Family dashboard
A simple web based dashboard - making API calls to other system and displaying the results.


# Running from Docker
```
docker build -t henock/family-dashboard . \
       && docker run -it -p 8080:80 \
       -env GIT_REPO="https://github.com/henock/family-dashboard.git" \
       henock/family-dashboard 
``` 
