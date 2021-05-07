/* eslint-disable no-console,no-process-exit,import/no-extraneous-dependencies,node/no-unpublished-require */
'use strict';

const path = require('path');

const fse = require('fs-extra');
const glob = require('glob');

const packagePath = process.cwd();
const buildPath = path.join(packagePath, './lib');
const sourcePath = path.join(packagePath, './src/packages');

async function createModulePackages({ from, to }) {
    const directoryPackages = glob.sync('*/index.js', { cwd: from }).map(path.dirname);

    await Promise.all(
        directoryPackages.map(async (directoryPackage) => {
            const packageJson = {
                sideEffects: false,
                typings: './index.d.ts',
            };
            const packageJsonPath = path.join(to, directoryPackage, 'package.json');

            const [typingsExist] = await Promise.all([
                fse.exists(path.join(to, directoryPackage, 'index.d.ts')),
                fse.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2)),
            ]);

            if (!typingsExist) {
                throw new Error(`index.d.ts for ${directoryPackage} is missing`);
            }

            return packageJsonPath;
        })
    );
}

async function filesCopy({ from, to }) {
    if (!(await fse.exists(to))) {
        console.warn(`path ${to} does not exists`);

        return [];
    }

    const files = glob.sync('**/*.d.ts', { cwd: from });
    const fonts = glob.sync('**/*.ttf', { cwd: from });
    const images = glob.sync('**/*.png', { cwd: from });
    const jsons = glob.sync('**/*.json', { cwd: from });
    const scss = glob.sync('**/*.scss', { cwd: from });

    const cmds = []
        .concat(files, fonts, images, jsons, scss)
        .map((file) => fse.copy(path.resolve(from, file), path.resolve(to, file)));

    return Promise.all(cmds);
}

async function createPackageFile() {
    const packageData = await fse.readFile(path.resolve(packagePath, './package.json'), 'utf8');
    const { nyc, scripts, devDependencies, husky, workspaces, ...packageDataOther } = JSON.parse(
        packageData
    );

    const newPackageData = {
        ...packageDataOther,
        private: false,
    };

    const targetPath = path.resolve(buildPath, './package.json');

    await fse.writeFile(targetPath, JSON.stringify(newPackageData, null, 2), 'utf8');
    console.log(`Created package.json in ${targetPath}`);
}

async function run() {
    try {
        await createPackageFile();
        // TypeScript
        await filesCopy({ from: sourcePath, to: buildPath });

        await createModulePackages({ from: sourcePath, to: buildPath });
    } catch (error) {
        console.error(error);

        process.exit(1);
    }
}

run();
