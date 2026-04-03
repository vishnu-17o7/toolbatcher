#!/usr/bin/env bash
# install.sh - bootstrap installer for toolbatcher on Linux/macOS

set -e
	echo "Running Toolbatcher bootstrap installer..."

# Check for required tools
command -v curl >/dev/null 2>&1 || { echo >&2 "curl is required but not installed. Installing..."; 
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install curl ;
    else
        sudo apt update && sudo apt install -y curl ;
    fi
}

# Create temp dir
tmpdir=$(mktemp -d)
echo "Using temp dir: $tmpdir"
cd "$tmpdir"

# Download main installer script
curl -fsSL https://toolbatcher.com/install/install_main.sh -o install_main.sh
chmod +x install_main.sh

# Run main installer
bash install_main.sh "$@"
