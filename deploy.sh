#!/bin/bash

# production server (SSH public key authnetication)
SERVER=34.130.74.56

# building the frontend image (--squash is experimental and optional)
docker build  -t frontend -f frontend.dockerfile .
uploading the image on production server
docker save frontend | bzip2 | pv | ssh $SERVER docker load

# # same with the backend 
docker build  -t backend -f backend.dockerfile .
docker save backend | bzip2 | pv | ssh $SERVER docker load

# # copy docker-compose and .env
scp docker-compose.yml $SERVER:.
scp .env $SERVER:.

# # stop all container on the production server
ssh $SERVER docker-compose down --remove-orphans

# # remove dangling images
ssh $SERVER  docker images --filter "dangling=true" -q --no-trunc | xargs -r docker rmi

# # restart all containers
ssh $SERVER docker-compose up -d
