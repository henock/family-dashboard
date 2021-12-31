#!/bin/sh


set -euo pipefail

TODAY="$(date -I)"
LAST_CODE_UPDATE="{ \"lastCodeUpdate\": \"$TODAY\" }"
SOURCE_FOLDER="/source"
SECRETS_FOLDER="/secrets"
RUNTIME_CONFIG_FILE="runtime-config.json"
LOG_PREFIX="deployments-on-"
LOG_SUFFIX=".log.txt"                                         # .txt suffix allows the log files to be viewed in the browser
LOG_DIR="/var/log/continuous-deployment"
FAMILY_DASHBOARD_FOLDER="$SOURCE_FOLDER/family-dashboard"
GIT_FOLDER="$FAMILY_DASHBOARD_FOLDER/.git"
WEBSITE_FOLDER="$FAMILY_DASHBOARD_FOLDER/website"
TODAYS_LOG_FILE_NAME="$LOG_PREFIX$TODAY$LOG_SUFFIX"

UPDATE_STATE="NOTHING_SET"

NGINX_WEBSITE_FOLDER="/usr/share/nginx/html/family-dashboard"
NGINX_WEBSITE_LOGS_FOLDER="$NGINX_WEBSITE_FOLDER/logs"
NGINX_WEBSITE_LOGS_INDEX_FILE="$NGINX_WEBSITE_LOGS_FOLDER/index.html"


log (){
  TODAY="$(date -I)"
  TODAYS_LOG_FILE_NAME="$LOG_PREFIX$TODAY$LOG_SUFFIX"
  TODAYS_LOG_FILE="$LOG_DIR/$TODAYS_LOG_FILE_NAME"
  LOG_LINE="$(date) - $1"
  echo "$LOG_LINE"
  echo "$LOG_LINE" >> "$TODAYS_LOG_FILE"
}

show_all_variables(){
  log "Variables"
  log "================================================"
  log "LOG_DIR=$LOG_DIR"
  log "SOURCE_FOLDER=$SOURCE_FOLDER"
  log "SECRETS_FOLDER=$SECRETS_FOLDER"
  log "RUNTIME_CONFIG_FILE=$RUNTIME_CONFIG_FILE"
  log "FAMILY_DASHBOARD_FOLDER=$FAMILY_DASHBOARD_FOLDER"
  log "GIT_FOLDER=$GIT_FOLDER"
  log "WEBSITE_FOLDER=$WEBSITE_FOLDER"
  log "TODAYS_LOG_FILE_NAME=$TODAYS_LOG_FILE_NAME"
  log "NGINX_WEBSITE_FOLDER=$NGINX_WEBSITE_FOLDER"
  log "NGINX_WEBSITE_LOGS_FOLDER=$NGINX_WEBSITE_LOGS_FOLDER"
  log "NGINX_WEBSITE_LOGS_INDEX_FILE=$NGINX_WEBSITE_LOGS_INDEX_FILE"
  log "================================================"
}

banner_text() {
  log "================================================"
  log ""
  log "   $1 "
  log ""
  log "================================================"
}

create_if_not_existing(){
  if test ! -e "$1"; then
    log "Creating $1"
    mkdir -p "$1"
  fi
}

init_website(){
  banner_text "Deploying website (1st time)!"
  show_all_variables
  create_if_not_existing "$NGINX_WEBSITE_FOLDER"
  create_if_not_existing "$NGINX_WEBSITE_LOGS_FOLDER"
}

copy_files_to_website(){
  test  -e "$WEBSITE_FOLDER" || log "ERROR - $WEBSITE_FOLDER doesn't exist"
  test  -e "$NGINX_WEBSITE_FOLDER" || log "ERROR - $NGINX_WEBSITE_FOLDER doesn't exist"

  log "Copying source files ($WEBSITE_FOLDER/* -> $NGINX_WEBSITE_FOLDER)."
  cp -Rvf "$WEBSITE_FOLDER/"* "$NGINX_WEBSITE_FOLDER"
  cp -Rvf "$SECRETS_FOLDER/"* "$NGINX_WEBSITE_FOLDER/data"
  log "Writing $LAST_CODE_UPDATE to $NGINX_WEBSITE_FOLDER/data/last-code-update.json"
  echo "$LAST_CODE_UPDATE" > "$NGINX_WEBSITE_FOLDER/data/last-code-update.json"
  log "Site update complete."
}

fetch_latest(){
  if git fetch && git diff origin/master | grep diff; then
    log "There is a difference on origin/master pulling into $(pwd)"
    if git pull origin master; then
      log "Pull completed successfully."
      UPDATE_STATE="UPDATE_SITE"
      return 0
    else
      banner_text "ERROR PULL FAILED!"
      return 1
    fi
  else
    log "Local repository is up to date."
    return 0
  fi
}

clone_project(){
  if git clone "https://github.com/henock/family-dashboard.git"; then
    log "Clone completed successfully"
    UPDATE_STATE="UPDATE_SITE"
    return 0
  else
    banner_text "ERROR CLONE FAILED!"
    return 1
  fi
}

update_source_files(){
  cd $SOURCE_FOLDER
  if test -e "$GIT_FOLDER"; then
    cd $FAMILY_DASHBOARD_FOLDER
    fetch_latest
    return $?
  else
    clone_project
    return $?
  fi
}

clean_up_old_logs(){
  TEN_DAYS_AGO=$(date -I -d now-10-days)
  LOG_TO_DELETE="$LOG_DIR/$LOG_PREFIX$TEN_DAYS_AGO$LOG_SUFFIX"
  if test -e "$LOG_TO_DELETE"; then
      log "Deleting 10 days old log: $LOG_TO_DELETE"
      rm "$LOG_TO_DELETE" || log "ERROR - failed to delete $LOG_TO_DELETE"
      log "Log files found in $LOG_DIR"
      for i in "$LOG_DIR/"*; do
        log "$LOG_DIR/$i"
      done
  else
    log "Cleaning up logs: Log from 10 days ago not found $LOG_TO_DELETE"
  fi
}

link_logs(){
  test -e "$NGINX_WEBSITE_LOGS_INDEX_FILE" && rm "$NGINX_WEBSITE_LOGS_INDEX_FILE"
  echo "<html><h1>Logs</h1><ol>"  >> "$NGINX_WEBSITE_LOGS_INDEX_FILE"

  for i in $(ls "$LOG_DIR/"*); do
    BASE_NAME=$(basename "$i")
    if ! test  -e "$NGINX_WEBSITE_LOGS_FOLDER/$BASE_NAME"; then
      log "ln -s \"$i\" \"$NGINX_WEBSITE_LOGS_FOLDER/$BASE_NAME\""
      ln -s "$i" "$NGINX_WEBSITE_LOGS_FOLDER/$BASE_NAME"
    fi
    echo "<li><a href='$BASE_NAME'>$BASE_NAME</a></li>" >> "$NGINX_WEBSITE_LOGS_INDEX_FILE"
  done

  echo "</ol></html>"  >> "$NGINX_WEBSITE_LOGS_INDEX_FILE"
}

########## START OF SCRIPT ##########
test -e "$FAMILY_DASHBOARD_FOLDER" || init_website
update_source_files
if [[ "$UPDATE_STATE" == "UPDATE_SITE" ]] ; then
  copy_files_to_website
fi
clean_up_old_logs
link_logs
log "================================================"