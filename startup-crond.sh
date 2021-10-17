#!/bin/sh
crontab -l > /current_cron
mkdir /etc/periodic/1min
echo '*       *       *       *       *       /etc/periodic/1min/continuously-deploy-website.sh' >> /current_cron 2>&1
crontab current_cron
rm current_cron
crond -l 2 -b