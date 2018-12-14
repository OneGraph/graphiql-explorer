#!/bin/bash

set -e
set -o pipefail

if [ ! -d "node_modules/.bin" ]; then
  echo "Be sure to run \`npm install\` before building GraphiQL Explorer."
  exit 1
fi

rm -rf dist/ && mkdir -p dist/
babel src --ignore __tests__ --out-dir dist/
echo "Bundling graphiqlExplorer.js..."
browserify -g browserify-shim -s GraphiQLExplorer dist/index.js > graphiqlExplorer.js
echo "Bundling graphiqlExplorer.min.js..."
browserify -g browserify-shim -t uglifyify -s GraphiQLExplorer dist/index.js | uglifyjs -c > graphiqlExplorer.min.js
# echo "Bundling graphiql.css..."
# postcss --no-map --use autoprefixer -d dist/ css/*.css
# cat dist/*.css > graphiql.css
echo "Done"
