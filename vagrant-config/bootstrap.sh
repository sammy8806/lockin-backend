#!/usr/bin/env bash
TARGET_NODE_VERSION="v5.3.0"

NODE_VERSION=$(node -v)
if [ "$NODE_VERSION" != "$TARGET_NODE_VERSION" ]; then
    echo "Installing actual NodeJS Version"

    cd /opt;
    echo "Downloading NodeJS ${TARGET_NODE_VERSION} ..."
    wget -q "https://nodejs.org/dist/${TARGET_NODE_VERSION}/node-${TARGET_NODE_VERSION}-linux-x64.tar.gz"
    echo "Downloading done"
    tar xf node-${TARGET_NODE_VERSION}-linux-x64.tar.gz
    rm node-stable
    ln -s node-${TARGET_NODE_VERSION}-linux-x64 node-stable
    cd -
fi

echo "Preparing MongoDB Datadir"
sudo mkdir -p /var/lib/mongodb/
sudo chown mongodb:mongodb -R /var/lib/mongodb/

sudo systemctl restart mongod.service

echo "Installing cl-node.service"
sudo cp /srv/server/vagrant-config/cl-node.service /etc/systemd/system/cl-node.service
sudo systemctl daemon-reload
sudo systemctl enable cl-node
sudo systemctl start cl-node

sudo systemctl status cl-node

echo "Nothing to do here at the moment ...";
