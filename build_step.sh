#!/bin/bash

npm install
rm -rf dist

cd frontend
npm install
npm run build

cp -r dist ..