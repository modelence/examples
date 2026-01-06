#!/bin/bash

# Run npm audit fix in all example directories
EXAMPLES_DIR=$(dirname "$0")

for dir in "$EXAMPLES_DIR"/*/ ; do
  if [ -f "$dir/package.json" ]; then
    echo "Running npm audit fix in $(basename "$dir")..."
    (cd "$dir" && npm audit fix)
    echo ""
  fi
done

echo "Audit fix completed for all examples!"
