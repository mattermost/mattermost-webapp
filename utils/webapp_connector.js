// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * Create a placeholder webappConnector if one doesn't exist. Likely means we're not running in the desktop client.
 */
if (!window.webappConnector) {
    window.webappConnector = {
        active: false,
        on: () => { }, //eslint-disable-line no-empty-function
        removeListener: () => { }, //eslint-disable-line no-empty-function
        emit: () => { }, //eslint-disable-line no-empty-function
    };
}

/**
* Returns a reference to the webappConnector if available, or a placeholder object to silently ignore any interaction
*/
export const webappConnector = window.webappConnector;
