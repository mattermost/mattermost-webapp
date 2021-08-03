// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createBrowserHistory} from 'history';

import {isServerVersionGreaterThanOrEqualTo} from 'utils/server_version';
import {isDesktopApp, getDesktopVersion} from 'utils/user_agent';

const b = createBrowserHistory({basename: window.basename});
const isDesktop = isDesktopApp() && isServerVersionGreaterThanOrEqualTo(getDesktopVersion(), '5.0.0');

window.addEventListener('message', ({origin, data: {type, message = {}} = {}} = {}) => {
    if (origin !== window.location.origin) {
        return;
    }

    switch (type) {
    case 'browser-history-push-return': {
        const {pathName} = message;
        b.push(pathName);
        break;
    }
    }
});

export const browserHistory = {
    ...b,
    push: (path, ...args) => {
        if (isDesktop) {
            window.postMessage(
                {
                    type: 'browser-history-push',
                    message: {
                        path: path.pathname || path,
                    },
                },
                window.location.origin,
            );
        } else {
            b.push(path, ...args);
        }
    },
};
