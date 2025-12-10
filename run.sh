# !/bin/bash

docker compose up -d
# source the .env file to load environment variables
source .env && ngrok http --url=pseudoapoplectical-dactylographic-tami.ngrok-free.dev 3000