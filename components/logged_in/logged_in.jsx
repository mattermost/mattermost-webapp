// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Redirect} from 'react-router';
import {viewChannel} from 'mattermost-redux/actions/channels';
import semver from 'semver';

import * as GlobalActions from 'actions/global_actions.jsx';
import * as WebSocketActions from 'actions/websocket_actions.jsx';
import * as UserAgent from 'utils/user_agent';
import LoadingScreen from 'components/loading_screen';
import {getBrowserTimezone} from 'utils/timezone.jsx';
import store from 'stores/redux_store.jsx';
import WebSocketClient from 'client/web_websocket_client.jsx';
import BrowserStore from 'stores/browser_store';

const dispatch = store.dispatch;
const getState = store.getState;

const BACKSPACE_CHAR = 8;

export default class LoggedIn extends React.PureComponent {
    static propTypes = {
        currentUser: PropTypes.object,
        currentChannelId: PropTypes.string,
        children: PropTypes.object,
        mfaRequired: PropTypes.bool.isRequired,
        enableTimezone: PropTypes.bool.isRequired,
        actions: PropTypes.shape({
            autoUpdateTimezone: PropTypes.func.isRequired,
            getChannelURLAction: PropTypes.func.isRequired,
        }).isRequired,
        showTermsOfService: PropTypes.bool.isRequired,
    }

    constructor(props) {
        super(props);

        const root = document.getElementById('root');
        if (root) {
            root.className += ' channel-view';
        }
    }

    isValidState() {
        return this.props.currentUser != null;
    }

    componentDidMount() {
        // Initialize websocket
        WebSocketActions.initialize();

        if (this.props.enableTimezone) {
            this.props.actions.autoUpdateTimezone(getBrowserTimezone());
        }

        // Make sure the websockets close and reset version
        window.addEventListener('beforeunload', this.handleBeforeUnload);

        // Listen for focused tab/window state
        window.addEventListener('focus', this.onFocusListener);
        window.addEventListener('blur', this.onBlurListener);

        // Listen for messages from the desktop app
        window.addEventListener('message', this.onDesktopMessageListener);

        // Tell the desktop app the webapp is ready
        window.postMessage(
            {
                type: 'webapp-ready',
            },
            window.location.origin,
        );

        // Device tracking setup
        if (UserAgent.isIos()) {
            document.body.classList.add('ios');
        } else if (UserAgent.isAndroid()) {
            document.body.classList.add('android');
        }

        if (!this.props.currentUser) {
            const rootEl = document.getElementById('root');
            if (rootEl) {
                rootEl.setAttribute('class', '');
            }
            GlobalActions.emitUserLoggedOutEvent('/login?redirect_to=' + encodeURIComponent(this.props.location.pathname), true, false);
        }

        // Prevent backspace from navigating back a page
        window.addEventListener('keydown', this.handleBackSpace);

        if (this.isValidState()) {
            BrowserStore.signalLogin();
        }
    }

    componentWillUnmount() {
        WebSocketActions.close();

        window.removeEventListener('keydown', this.handleBackSpace);

        window.removeEventListener('focus', this.onFocusListener);
        window.removeEventListener('blur', this.onBlurListener);
        window.removeEventListener('message', this.onDesktopMessageListener);
    }

    render() {
        if (!this.isValidState()) {
            return <LoadingScreen/>;
        }

        if (this.props.mfaRequired) {
            if (this.props.location.pathname !== '/mfa/setup') {
                return <Redirect to={'/mfa/setup'}/>;
            }
        } else if (this.props.location.pathname === '/mfa/confirm') {
            // Nothing to do. Wait for MFA flow to complete before prompting TOS.
        } else if (this.props.showTermsOfService) {
            if (this.props.location.pathname !== '/terms_of_service') {
                return <Redirect to={'/terms_of_service?redirect_to=' + encodeURIComponent(this.props.location.pathname)}/>;
            }
        }

        return this.props.children;
    }

    onFocusListener() {
        GlobalActions.emitBrowserFocus(true);
    }

    onBlurListener() {
        GlobalActions.emitBrowserFocus(false);
    }

    // listen for messages from the desktop app
    onDesktopMessageListener = ({origin, data: {type, message = {}} = {}} = {}) => {
        if (!this.props.currentUser) {
            return;
        }
        if (origin !== window.location.origin) {
            return;
        }

        switch (type) {
        case 'register-desktop': {
            const {version} = message;
            if (!window.desktop) {
                window.desktop = {};
            }
            window.desktop.version = semver.valid(semver.coerce(version));
            break;
        }
        case 'user-activity-update': {
            const {userIsActive, manual} = message;

            // update the server with the users current away status
            if (userIsActive === true || userIsActive === false) {
                WebSocketClient.userUpdateActiveStatus(userIsActive, manual);
            }
            break;
        }
        case 'notification-clicked': {
            const {channel, teamId} = message;
            window.focus();

            // navigate to the appropriate channel
            this.props.actions.getChannelURLAction(channel, teamId);
            break;
        }
        }
    }

    handleBackSpace = (e) => {
        const excludedElements = ['input', 'textarea'];

        if (e.which === BACKSPACE_CHAR && !(excludedElements.includes(e.target.tagName.toLowerCase()))) {
            e.preventDefault();
        }
    }

    handleBeforeUnload = () => {
        // remove the event listener to prevent getting stuck in a loop
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        if (document.cookie.indexOf('MMUSERID=') > -1) {
            viewChannel('', this.props.currentChannelId || '')(dispatch, getState);
        }
        WebSocketActions.close();
    }
}
