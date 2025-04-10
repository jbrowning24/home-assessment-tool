#!/bin/bash

# server-manager.sh
# Script to manage React development server instances

PORT=3000
PID_FILE=./.react-server.pid

# Check if server is already running
check_server() {
  if [ -f "$PID_FILE" ]; then
    local pid=$(cat "$PID_FILE")
    if ps -p "$pid" > /dev/null; then
      echo "Server is running with PID: $pid"
      return 0
    else
      echo "Stale PID file found, cleaning up"
      rm "$PID_FILE"
    fi
  fi
  
  # Also check if any process is using the port
  if lsof -i :$PORT > /dev/null; then
    echo "Port $PORT is in use but not by our tracked server"
    return 1
  fi
  
  echo "No server running"
  return 2
}

# Stop server if running
stop_server() {
  if [ -f "$PID_FILE" ]; then
    local pid=$(cat "$PID_FILE")
    if ps -p "$pid" > /dev/null; then
      echo "Stopping server with PID: $pid"
      kill "$pid"
      rm "$PID_FILE"
      return 0
    else
      echo "Removing stale PID file"
      rm "$PID_FILE"
    fi
  fi
  
  # Find and kill any process using port 3000
  local port_pid=$(lsof -t -i:$PORT)
  if [ -n "$port_pid" ]; then
    echo "Killing process using port $PORT: $port_pid"
    kill "$port_pid"
    return 0
  fi
  
  echo "No server to stop"
  return 1
}

# Start a new server instance
start_server() {
  echo "Starting new server..."
  nohup npx react-scripts start > .server.log 2>&1 &
  echo $! > "$PID_FILE"
  echo "Server started with PID: $(cat "$PID_FILE")"
}

# Main logic
case "$1" in
  start)
    check_server
    status=$?
    if [ $status -eq 0 ]; then
      echo "Server already running"
    else
      if [ $status -eq 1 ]; then
        stop_server
      fi
      start_server
    fi
    ;;
  stop)
    stop_server
    ;;
  restart)
    stop_server
    sleep 2
    start_server
    ;;
  status)
    check_server
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status}"
    exit 1
    ;;
esac

exit 0