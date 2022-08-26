/* eslint-disable no-console,promise/avoid-new */
'use strict';

const path = require('path');
// eslint-disable-next-line security/detect-child-process
const { exec } = require('child_process');

const fse = require('fs-extra');

const packagePath = process.cwd();
const buildPath = path.join(packagePath, './lib');

// a exec function that runs as a promise
const execWithPromise = (command, options, callback) =>
    new Promise((resolve) => {
        exec(command, options, (error, stout, sterr) => {
            if (callback && typeof callback === 'function') {
                callback();
            }

            resolve(error ? stout : sterr);
        });
    });

// build the package
const build = async () => {
    console.log('--> running `npm build`');
    await execWithPromise('npm run build', { cwd: packagePath });
    console.log('--> finished package build');
    console.log('');
    console.log('-'.repeat(process.stdout.columns));
    console.log('');
};

// pack the
const pack = async () => {
    console.log('--> running `npm pack`');
    await execWithPromise('npm pack', { cwd: buildPath });
    console.log('--> finished packing');
    console.log('');
    console.log('-'.repeat(process.stdout.columns));
    console.log('');
};

/** NOTE: This is currently not possible (I have not found a good solution to do
 * this), so I am disablong it for now and instead print the absolute path
 * to the INFO
 */
// pack the
// const setPackagePathVariable = async (pathToFile) => {
//     console.log('--> setting ENV variable for compass components package');
//     await execWithPromise(`export COMPASS_COMPONENTS_PACKAGE_PATH=${pathToFile}`);
//     console.log('--> variable has been set');
//     console.log('INFO: to install the local package in your project run this command:');
//     console.log('npm install -S "$COMPASS_COMPONENTS_PACKAGE_PATH"');
// };

const movePack = async () => {
    // read the current package.json file
    const packageData = await fse.readFile(path.resolve(packagePath, './package.json'), 'utf8');
    // extract the needed values from the package.json data
    const { name, version, ...packageDataOtherIgnore } = JSON.parse(packageData);
    // sanitize the package name (removing `@` and all `/`)
    const packageName = name.slice(name.startsWith('@') ? 1 : 0).replace('/', '-');
    // construct the file name
    const fileName = `${packageName}-${version}.tgz`;

    // copy the files to the root folder
    await fse.copy(path.join(buildPath, fileName), path.join(packagePath, 'packed.tgz'));
    console.log('INFO: to install the local package in your project run this command:');
    console.log('');
    console.log(`npm install -S "${path.join(packagePath, 'packed.tgz')}"`);
    console.log('');
    console.log('-'.repeat(process.stdout.columns));
    console.log('');

    return path.join(packagePath, 'packed.tgz');
};

build()
    .then(() => pack())
    .then(() => movePack())
    // .then((pathToFile) => setPackagePathVariable(pathToFile))
    .catch((error) => console.log('!!! SOMETHING WENT WRONG !!!', error));
