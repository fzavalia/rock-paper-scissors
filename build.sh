#!/bin/bash

cd frontend

npm install

npm run build

cd ../backend

npm install

npm run build

cd ..

mkdir dist

cp -r backend/build dist/server

cp -r backend/node_modules dist/node_modules

cp -r frontend/build dist/server/public