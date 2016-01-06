#!/usr/bin/env bash
echo "Checking NPM Stuff"
PATH=/usr/local/bin:/usr/bin:/bin

if [ -f "/srv/server/.vars.local" ]; then
    . /srv/server/.vars.local
fi

if [ -z "$SERVER_DEVEL" ]; then
    cd /srv/server/

    echo "Running npm install"
    npm install

    echo "Running npm update"
    npm update

    echo "npm done ..."
fi
