#!/bin/bash
cd /home/z/my-project
export HOSTNAME="0.0.0.0"
export PORT=3000
export NODE_ENV=production
exec node /home/z/my-project/.next/standalone/server.js
