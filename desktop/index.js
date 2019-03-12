// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import WebappConnector from './WebappConnector';

/**
 * Connect the webapp to the desktop bridge
 */
export function initializeDesktopBridge() {
    if (window.desktopBridge && !window.desktopBridge.ready && window.desktopBridge.registerWebappConnector) {
        window.desktopBridge.registerWebappConnector(new WebappConnector());
    }
}

/**
 * Get a reference to the desktop connector on the desktop bridge
 */
export function getDesktopConnector() {
    if (window.desktopBridge && window.desktopBridge.ready) {
        return window.desktopBridge.desktop;
    }
    return null;
}

/**
 * Get a reference to the webapp connector on the desktop bridge
 */
export function getWebappConnector() {
    if (window.desktopBridge && window.desktopBridge.ready) {
        return window.desktopBridge.webapp;
    }
    return null;
}
