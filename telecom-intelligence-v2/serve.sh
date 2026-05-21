#!/bin/bash
cd /home/z/my-project
while true; do
  NODE_OPTIONS="--max-old-space-size=64" NODE_ENV=production node .next/standalone/server.js 2>/dev/null
  sleep 1
done
