// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

exports.command = function fillInput(element, string) {
    return this.
        waitForElementVisible(element, 3000).
        clearValue(element).
        pause(300).
        setValue(element, string).
        pause(1000);
};
