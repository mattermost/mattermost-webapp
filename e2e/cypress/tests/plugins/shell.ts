// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import extractZip from 'extract-zip';
import shell from 'shelljs';

export const shellFind = ({path, pattern}) => {
    return shell.find(path).filter((file) => {
        return file.match(pattern);
    });
};

export const shellRm = ({option, file}) => {
    return shell.rm(option, file);
};

export const shellUnzip = async ({source, target}) => {
    try {
        await extractZip(source, {dir: target});
        return null;
    } catch (err) {
        return err;
    }
};
