FROM nginx:mainline-alpine

LABEL image.author="henock@zewde.com"
LABEL version="2021-10-09:1"

RUN apk add --update coreutils && rm -rf /var/cache/apk/*
RUN apk add --no-cache git

RUN rm /etc/nginx/conf.d/*
COPY ./nginx.conf /etc/nginx/nginx.conf

COPY startup-crond.sh /docker-entrypoint.d/startup-crond.sh
RUN chmod +x /docker-entrypoint.d/startup-crond.sh

COPY continuously-deploy-website.sh /docker-entrypoint.d/continuously-deploy-website.sh

RUN chmod +x /docker-entrypoint.d/continuously-deploy-website.sh

RUN mkdir /source
RUN mkdir /etc/periodic/1min
RUN mkdir /var/log/continuous-deployment

RUN cd /etc/periodic/1min && ln -s /docker-entrypoint.d/continuously-deploy-website.sh .