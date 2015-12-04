echo "Checking NPM Stuff"
PATH=/usr/local/bin:/usr/bin:/bin

if [ -z "$SERVER_DEVEL" ]; then
    cd /srv/server/src/

    echo "Running npm install"
    npm install

    echo "Running npm update"
    npm update

    echo "npm done ..."
fi
