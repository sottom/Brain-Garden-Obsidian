#!/bin/bash

# Navigate to the repository
cd /Users/Mitchell.Sotto/BrainGarden || exit 1

# Define git path
GIT_EXEC="/usr/bin/git"

# Print a timestamp separator
echo "=== Run at $(date '+%Y-%m-%d %H:%M:%S') ==="

# Execute Git commands (standard output and errors will go to the log)
$GIT_EXEC add .
$GIT_EXEC commit -m "Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')"
$GIT_EXEC push origin main
echo "" # Adds an empty line for readability between runs
