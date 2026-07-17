#!/bin/bash

# Provide the full path to standard macOS and Homebrew installation directories
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

# Navigate to the repository
cd /Users/Mitchell.Sotto/BrainGarden || exit 1

# Define git path
GIT_EXEC="/usr/bin/git"

# Print a timestamp separator
echo "=== Run at $(date '+%Y-%m-%d %H:%M:%S') ==="

# Limit the log file to the last 1000 lines
LOG_FILE="/Users/Mitchell.Sotto/BrainGarden/git_push_log.log"
if [ -f "$LOG_FILE" ]; then
    tail -n 1000 "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE"
fi

# Execute Git commands (standard output and errors will go to the log)
$GIT_EXEC add .
$GIT_EXEC commit -m "Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')"
$GIT_EXEC push origin main
echo "" # Adds an empty line for readability between runs
