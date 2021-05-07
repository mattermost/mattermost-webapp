/* eslint-disable security/detect-child-process */
'use strict';

const path = require('path');
const { exec } = require('child_process');

const packagePath = process.cwd();
const scriptPath = path.join(packagePath, './node_modules/@hmhealey/compass-icons');

exec('yarn && yarn run build', {
    cwd: scriptPath,
});
