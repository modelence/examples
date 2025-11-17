#!/bin/bash

# Script to update a specified package to a specified version across all example projects
# Usage: ./update-package.sh <package-name> [version]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required arguments are provided
if [ "$#" -lt 1 ]; then
    echo -e "${RED}Error: Missing required arguments${NC}"
    echo "Usage: $0 <package-name> [version]"
    echo "Example: $0 modelence 1.2.3"
    echo "         $0 modelence        (installs latest version)"
    exit 1
fi

PACKAGE_NAME=$1
VERSION=$2

if [ -z "$VERSION" ]; then
    echo -e "${GREEN}Updating ${PACKAGE_NAME} to latest version across all example projects...${NC}\n"
    VERSION_FLAG=""
else
    echo -e "${GREEN}Updating ${PACKAGE_NAME} to version ${VERSION} across all example projects...${NC}\n"
    VERSION_FLAG="@${VERSION}"
fi

# Find all example project directories (directories containing package.json, excluding hidden dirs)
EXAMPLE_DIRS=()
for dir in */; do
    # Remove trailing slash
    dir="${dir%/}"
    # Skip hidden directories (starting with .)
    if [[ ! "$dir" =~ ^\. ]] && [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
        EXAMPLE_DIRS+=("$dir")
    fi
done

# Track success/failure
SUCCESS_COUNT=0
SKIP_COUNT=0
FAIL_COUNT=0

for DIR in "${EXAMPLE_DIRS[@]}"; do
    if [ -d "$DIR" ] && [ -f "$DIR/package.json" ]; then
        echo -e "${YELLOW}Processing $DIR...${NC}"

        # Check if the package exists in package.json
        if grep -q "\"$PACKAGE_NAME\"" "$DIR/package.json"; then
            cd "$DIR"

            # Update the package to exact version
            if [ -z "$VERSION" ]; then
                echo "  - Updating $PACKAGE_NAME to latest version..."
                npm install "${PACKAGE_NAME}@latest" 2>&1 | sed 's/^/    /'
            else
                echo "  - Updating $PACKAGE_NAME to $VERSION..."
                npm install "${PACKAGE_NAME}@${VERSION}" 2>&1 | sed 's/^/    /'
            fi

            if [ $? -eq 0 ]; then
                echo -e "  ${GREEN}✓ Successfully updated and installed in $DIR${NC}\n"
                ((SUCCESS_COUNT++))
            else
                echo -e "  ${RED}✗ Failed to update in $DIR${NC}\n"
                ((FAIL_COUNT++))
            fi

            cd - > /dev/null
        else
            echo -e "  ${YELLOW}⊘ Package $PACKAGE_NAME not found in $DIR/package.json, skipping...${NC}\n"
            ((SKIP_COUNT++))
        fi
    else
        echo -e "${YELLOW}⊘ Skipping $DIR (not found or no package.json)${NC}\n"
        ((SKIP_COUNT++))
    fi
done

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Update Summary${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "✓ Successfully updated: ${GREEN}$SUCCESS_COUNT${NC} project(s)"
echo -e "⊘ Skipped: ${YELLOW}$SKIP_COUNT${NC} project(s)"
echo -e "✗ Failed: ${RED}$FAIL_COUNT${NC} project(s)"
echo -e "${GREEN}========================================${NC}"

if [ $FAIL_COUNT -gt 0 ]; then
    exit 1
fi
