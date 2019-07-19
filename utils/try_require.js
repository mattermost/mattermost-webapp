// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// Performs a safe require to the given path
// and returns null in case of failure
export default function tryRequire(path) {
    try {
        // eslint-disable-next-line global-require
        return require(path);
    } catch (err) {
        return null;
    }
}
