#!/bin/sh

set -euo pipefail

if test ! -f website/data/runtime-config.json; then
  echo "website/data/runtime-config.json not found - dashboard will not work!"
  echo "Exiting.. "
  exit 1
fi

docker build -t henock/family-dashboard .
docker run -p 8080:80 -v $(pwd)/config/runtime-config.json:/usr/share/nginx/html/family-dashboard/data/runtime-config.json henock/family-dashboard