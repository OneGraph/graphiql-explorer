#!/usr/bin/env sh

set -e

SCRIPT_PATH=$(dirname "$0")
cd $SCRIPT_PATH/..

echo "Reformatting all files..."
# runs refmt in 8 processes, with 16 files a piece
find src -name "*.re" -print0 | xargs -0 -P 8 -n 16 refmt --in-place