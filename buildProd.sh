#!/usr/bin/env bash

CLIENT_TARGET_DIR=html/public

# ensure jq installed
if ! command -v jq &>/dev/null; then
  echo "jq could not be found..."
  exit 1
fi

# create production build of client app
cd ui || exit
npm i
REACT_APP_VERSION=$(jq -r .version <package.json) npm run build

# copy client app
cd .. || exit

mkdir -p ${CLIENT_TARGET_DIR}

rm -r ${CLIENT_TARGET_DIR:?}/*

cp -r ui/build/* ${CLIENT_TARGET_DIR}/

# create .htaccess file
echo "FallbackResource index.html" >${CLIENT_TARGET_DIR}/.htaccess
