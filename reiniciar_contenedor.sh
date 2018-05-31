#!/bin/bash
sudo docker ps --all | grep extras | awk {'print $1}' | xargs sudo docker rm -f
sudo docker build --no-cache -t patriciochavez/extras-controller .
sudo docker run -d --name extras patriciochavez/extras-controller
