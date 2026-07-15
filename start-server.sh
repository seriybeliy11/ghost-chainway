#!/bin/bash
cd /home/z/my-project
while true; do
  NODE_OPTIONS="--max-old-space-size=4096" node .next/standalone/server.js -p 3000 >> /home/z/my-project/server.log 2>&1
  echo "[$(date)] Server exited, restarting in 2s..." >> /home/z/my-project/server.log
  sleep 2
done