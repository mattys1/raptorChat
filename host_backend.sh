#!/usr/bin/env bash

source .env

cd backend &&
go mod download &&
go mod tidy -e &&

CGO_ENABLED=0 GOOS=linux go build -tags debug -o backend ./src &&
./backend
