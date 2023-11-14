#!/bin/sh

cd /app/server
npm run start:dev &

cd /app/client
ng build --watch