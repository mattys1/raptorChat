#!/bin/bash

args = "$@"

docker compose down &&
docker-compose up sqlc --build &&
docker-compose up backend --build --force-recreate $args
