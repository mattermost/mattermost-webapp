// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import fs from 'fs';

import path from 'path';

/**
 * Checks whether a file exist in the fixtures folder
 */
export const fileExist = (filename: string) => {
    const filePath = path.resolve(__dirname, `../fixtures/${filename}`);

    return fs.existsSync(filePath);
};

/**
 * Write data to a file in the fixtures folder
 * filename - filename where to write data into
 * fixturesFolder - folder at tests/fixtures
 * data - The data to write
 */
export const writeToFile = ({filename, fixturesFolder, data = ''}: {filename: string; fixturesFolder: string; data: string}) => {
    const folder = path.resolve(__dirname, `../fixtures/${fixturesFolder}`);
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, {recursive: true});
    }

    const filePath = `${folder}/${filename}`;

    fs.writeFileSync(filePath, data);
    return null;
};
