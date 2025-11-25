#!/bin/bash
# Convenience script to generate video with virtual environment

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Use virtual environment Python directly
exec "$SCRIPT_DIR/venv/bin/python" src/generateSingle.py "$@"

