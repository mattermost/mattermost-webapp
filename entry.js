// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import ReactDOM from 'react-dom';

import {logError} from 'mattermost-redux/actions/errors';

// Import our styles
import 'sass/styles.scss';
import 'katex/dist/katex.min.css';

import '@mattermost/compass-icons/css/compass-icons.css';

import {isDevMode, setCSRFFromCookie} from 'utils/utils';
import {AnnouncementBarTypes} from 'utils/constants';
import store from 'stores/redux_store.jsx';
import App from 'components/app';

// Allow overriding the path used by webpack to dynamically resolve assets. This is driven by
// an environment variable in development, or by a window variable defined in root.html in
// production. The window variable is updated by the server after configuring SiteURL and
// restarting or by running the `mattermost config subpath` command.
window.publicPath = process.env.PUBLIC_PATH || window.publicPath || '/static/'; // eslint-disable-line no-process-env
__webpack_public_path__ = window.publicPath; // eslint-disable-line camelcase, @typescript-eslint/naming-convention, no-undef

// Define the subpath at which Mattermost is running. Extract this from the publicPath above to
// avoid depending on Redux state before it is even loaded. This actual global export is used
// in a minimum of places, as it is preferred to leverage react-router, configured to use this
// basename accordingly.
window.basename = window.publicPath.substr(0, window.publicPath.length - '/static/'.length);

// This is for anything that needs to be done for ALL react components.
// This runs before we start to render anything.
function preRenderSetup(callwhendone) {
    window.onerror = (msg, url, line, column, stack) => {
        if (msg === 'ResizeObserver loop limit exceeded') {
            return;
        }

        let displayable = false;
        if (isDevMode()) {
            displayable = true;
        }

        store.dispatch(
            logError({
                type: AnnouncementBarTypes.DEVELOPER,
                message: 'A JavaScript error in the webapp client has occurred. (msg: ' + msg + ', row: ' + line + ', col: ' + column + ').',
                stack,
                url,
            },
            displayable,
            true,
            ),
        );
    };
    setCSRFFromCookie();
    callwhendone();
}

function renderRootComponent() {
    ReactDOM.render((
        <App/>
    ),
    document.getElementById('root'));
}

/**
 * Adds a function to be invoked onload appended to any existing onload
 * event handlers.
 *
 * @param   {function} fn onload event handler
 *
 */
function appendOnLoadEvent(fn) {
    if (window.attachEvent) {
        window.attachEvent('onload', fn);
    } else if (window.onload) {
        const curronload = window.onload;
        window.onload = (evt) => {
            curronload(evt);
            fn(evt);
        };
    } else {
        window.onload = fn;
    }
}

appendOnLoadEvent(() => {
    // Do the pre-render setup and call renderRootComponent when done
    preRenderSetup(renderRootComponent);
});
