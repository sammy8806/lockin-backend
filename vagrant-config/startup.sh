#!/usr/bin/env bash
echo "Starting NodeJS"
PATH=/usr/local/bin:/usr/bin:/bin:/usr/local/games:/usr/games

PWD=/srv/server/src/ && node --harmony_modules --harmony_reflect --harmony_destructuring --harmony_new_target /srv/server/src/server.js > /srv/server/log/node_server.log &
