// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

let callback;

window.desktopBridge = {};

export function connect(callbackFunction) {
    // store provided callback for later use
    callback = callbackFunction;

    // connect bridge methods
    window.desktopBridge.updateUserActivityStatus = updateUserActivityStatus;
}

const updateUserActivityStatus = (userIsActive) => {
    callback('updateUserActivityStatus', {userIsActive});
};
