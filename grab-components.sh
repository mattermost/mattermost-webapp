#!/bin/bash

git clone https://github.com/mattermost/compass-components.git packages/compass-components

# I'm not accidentally deleting my .git again, dammit!
rm -rf packages/compass-components/.git

cd packages/compass-components
rm -rf yarn.lock

perl -pi -e 's/"name": "compass-components"/"name": "\@hmhealey\/compass-components"/' package.json
perl -pi -e 's/"version": "1.0.0"/"version": "5.36.0-1"/' package.json
perl -pi -e 's/github:mattermost\/compass-icons#5fc43ecf90ba697613e02a6201811894b7b74f60/5.36.0-1/' package.json
perl -pi -e 's/yarn/npm/g' package.json
perl -pi -e 's/"scripts": {/"files": [\n        "lib"\n    ],\n    "scripts": {\n        "prepack": "npm run build",/' package.json
find . -type f -exec perl -pi -e "s/\@mattermost/\@hmhealey/g" {} +
cd ../..


git clone https://github.com/mattermost/compass-icons.git packages/compass-icons

rm -rf packages/compass-icons/.git

cd packages/compass-icons
rm -rf yarn.lock package-lock.json

perl -pi -e 's/"name": "\@mattermost\/compass-icons"/"name": "\@hmhealey\/compass-icons"/' package.json
perl -pi -e 's/"version": "0.1.0"/"version": "5.36.0-1"/' package.json
perl -pi -e 's/yarn/npm/g' package.json
perl -pi -e 's/    "private": true,\n//' package.json
perl -pi -e 's/"scripts": {/"files": [\n        "build"\n    ],\n    "scripts": {\n        "prepack": "npm run build",/' package.json
find . -type f -exec perl -pi -e "s/\@mattermost/\@hmhealey/g" {} +
cd ../..
