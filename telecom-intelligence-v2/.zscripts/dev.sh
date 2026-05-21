#!/bin/bash
cd /home/z/my-project

# Generate Prisma client
npx prisma generate 2>/dev/null

# Push database schema  
npx prisma db push 2>/dev/null

# Build if not already built
if [ ! -f ".next/standalone/server.js" ]; then
  npm run build
fi

# Start production server with memory limit (uses less memory than dev server)
exec NODE_OPTIONS="--max-old-space-size=128" NODE_ENV=production node .next/standalone/server.js
