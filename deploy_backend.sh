#!/bin/bash

docker-compose up sqlc --build &&
docker-compose up backend --build --force-recreate -d
