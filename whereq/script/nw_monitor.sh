#!/bin/bash

get_timestamp() {
    echo "$(date +'%Y-%m-%d %H:%M:%S.%3N')"
}

log_monitor() {
    echo "[$(get_timestamp)] $1" >> "$MONITOR_LOG_FILE"
}

log_running() {
    echo "[$(get_timestamp)] $1" >> "$RUNNING_LOG_FILE"
}


# Set the application name in pm2
APP_NAME="NextWeb"
APP_DIR="$HOME/nw"

# Set log file path
LOG_DIR="$HOME/logs"
MONITOR_LOG_FILE="$LOG_DIR/${APP_NAME}_monitor_$(date +'%Y%m%d').log"
RUNNING_LOG_FILE="$LOG_DIR/${APP_NAME}_running_$(date +'%Y%m%d').log"

# Check if log directory exists, if not create it
mkdir -p "$LOG_DIR"

# Log timestamp and start of execution with milliseconds
echo "----" >> "$MONITOR_LOG_FILE"
log_monitor "Starting ${APP_NAME} monitor script"

# Set pm2 and yarn path 
NODE_BIN_FOLDER=/home/whereq/.nvm/versions/node/v20.11.1/bin
PM2=${NODE_BIN_FOLDER}/pm2
YARN=${NODE_BIN_FOLDER}/yarn

# Check if pm2 is available
if [ -z "$PM2" ]; then
    log_monitor "pm2 not found. Please make sure pm2 is installed and available in PATH."
    exit 1
fi

# Run "pm2 pid" command and capture the output
log_monitor "Get PID: $PM2 pid ${APP_NAME}"
pid_output="$PM2 pid '${APP_NAME}'"
log_monitor "$pid_output"

# Count the number of lines in the output
output=$(${PM2} pid "${APP_NAME}")
log_monitor "output: ${output}"
num_lines=$(echo "$output" | wc -l)
log_monitor "num_lines: $num_lines"

# Check if there are more than 1 line in the output
if [ "$num_lines" -gt 1 ]; then
    # There shouldn't be multiple apps of same name running in pm2
    # If exists, delete them, then start 1 app
    log_monitor "$PM2 delete '$APP_NAME'"
    $PM2 delete "$APP_NAME"
    cd $APP_DIR
    log_running "${PM2} start ${YARN} --name ${APP_NAME} -- start" 
    $PM2 start $YARN --name "${APP_NAME}" -- start >> "$RUNNING_LOG_FILE" 2>&1
elif [ "$num_lines" -eq 1 ]; then
    # Check if the output is empty
    if [ -z "$pid_output" ]; then
        # Run commands for case 2
        cd $APP_DIR
        log_running "${PM2} start {YARN} --name ${APP_NAME} -- start" 
        $PM2 start $YARN --name "${APP_NAME}" -- start >> "$RUNNING_LOG_FILE" 2>&1
    else
        # Extract the PID from the output
        pid=$(${PM2} pid "${APP_NAME}")
        # Check if the PID is 0
        if [ "$pid" == "0" ]; then
            # Run commands for case 3
            $PM2 restart "$APP_NAME"
        else
            # Run commands for case 4
            log_monitor "${APP_NAME} is already running."
        fi
    fi
fi

# Log end of execution with milliseconds
log_monitor "Finished ${APP_NAME} monitor script"

