#!/bin/bash

set -e
set -o pipefail

if [ ! -d "node_modules/.bin" ]; then
  echo "Be sure to run \`npm install\` before building GraphiQL Explorer."
  exit 1
fi

rm -rf dist/ && mkdir -p dist/
babel src --out-dir dist/
echo "Done"
