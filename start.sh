#!/bin/bash

# Start the Express API backend on port 4001 in the background
echo "Starting backend API..."
export PORT=4001
npm --workspace apps/api run start &
API_PID=$!

# Wait for a second to ensure backend starts
sleep 2

# Start the Next.js frontend in the foreground
# Render will automatically map the $PORT environment variable to this frontend
echo "Starting Next.js web interface..."
export PORT=$RENDER_PORT
if [ -z "$PORT" ]; then
  export PORT=4000
fi

npm --workspace apps/web run start

# If frontend crashes or exits, gracefully kill backend
kill $API_PID
