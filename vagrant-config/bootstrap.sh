#!/usr/bin/env bash

echo "Preparing MongoDB Datadir"
sudo mkdir -p /var/lib/mongodb/
sudo chown mongodb:mongodb -R /var/lib/mongodb/

sudo systemctl restart mongod.service

echo "Installing cl-node.service"
sudo cp /vagrant/vagrant-config/cl-node.service /etc/systemd/system/cl-node.service
sudo systemctl daemon-reload
sudo systemctl enable cl-node
sudo systemctl start cl-node

sudo systemctl status cl-node

echo "Nothing to do here at the moment ...";
