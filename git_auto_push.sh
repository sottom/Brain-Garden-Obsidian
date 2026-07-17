#!/bin/bash

# Define the absolute path to your local Git repository
REPO_DIR="/Users/Mitchell.Sotto/BrainGarden"

# Use the absolute path to the git executable (typical for macOS)
GIT_EXEC="/usr/bin/git"

# Limit the log file to the last 1000 lines
LOG_FILE="/Users/Mitchell.Sotto/BrainGarden/git_push_log.log"
if [ -f "$LOG_FILE" ]; then
    tail -n 1000 "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE"
fi

# Navigate to the repository directory
if cd "$REPO_DIR"; then
    # Add all changes (tracked and untracked)
    $GIT_EXEC add .

    # Check if there are changes to commit
    if ! $GIT_EXEC diff-index --cached --quiet HEAD --; then
        # Commit with a timestamped message
        $GIT_EXEC commit -m "Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')"
        
        # Push to the remote repository (adjust branch name if needed)
        $GIT_EXEC push origin main
    fi
else
    echo "Directory $REPO_DIR not found." >&2
    exit 1
fi
