#!/bin/sh

set -euo pipefail

if test ! -f website/data/runtime-config.json; then
  echo "website/data/runtime-config.json not found - dashboard will not work!"
  echo "Exiting.. "
  exit 1
fi


echo "{ \"lastCodeUpdate\": \"$(date)\" }" > website/data/last-code-update.json
python3 -m http.server  > http-server-logs/server.log 2>&1 &
