// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Redirect} from 'react-router';
import {UserProfile} from 'mattermost-redux/src/types/users';
import {viewChannel} from 'mattermost-redux/actions/channels';
import semver from 'semver';
import {Channel} from 'mattermost-redux/types/channels';

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

type Props = {
    currentUser?: UserProfile | Record<string, unknown> | null,
    currentChannelId?: string,
    children?: JSX.Element,
    mfaRequired: boolean,
    enableTimezone: boolean,
    actions: {
        autoUpdateTimezone: (a: string) => void,
        getChannelURLAction: (a: Channel, b: string) => any,
    },
    showTermsOfService: boolean,
    location: {
        pathname: string
    }
}

type DesktopMessageListener = {
    origin?: string
    data?: {
        type?: string,
        message?: Record<string, any>
    }
}

export default class LoggedIn extends React.PureComponent<Props> {
    constructor(props: Props) {
        super(props);

        const root = document.getElementById('root');
        if (root) {
            root.className += ' channel-view';
        }
    }

    isValidState(): boolean {
        return this.props.currentUser != null;
    }

    componentDidMount(): void {
        // Initialize websocket
        WebSocketActions.initialize();

        const {enableTimezone, location, actions, currentUser} = this.props;

        if (enableTimezone) {
            actions.autoUpdateTimezone(getBrowserTimezone());
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

        if (!currentUser) {
            const rootEl = document.getElementById('root');
            if (rootEl) {
                rootEl.setAttribute('class', '');
            }
            GlobalActions.emitUserLoggedOutEvent('/login?redirect_to=' + encodeURIComponent(location.pathname), true, false);
        }

        // Prevent backspace from navigating back a page
        window.addEventListener('keydown', this.handleBackSpace);

        if (this.isValidState()) {
            BrowserStore.signalLogin();
        }
    }

    componentWillUnmount(): void {
        WebSocketActions.close();

        window.removeEventListener('keydown', this.handleBackSpace);

        window.removeEventListener('focus', this.onFocusListener);
        window.removeEventListener('blur', this.onBlurListener);
        window.removeEventListener('message', this.onDesktopMessageListener);
    }

    render(): JSX.Element | undefined {
        const {location, children, showTermsOfService, mfaRequired} = this.props;
        if (!this.isValidState()) {
            return <LoadingScreen/>;
        }

        if (mfaRequired) {
            if (location.pathname !== '/mfa/setup') {
                return <Redirect to={'/mfa/setup'}/>;
            }
        } else if (location.pathname === '/mfa/confirm') {
            // Nothing to do. Wait for MFA flow to complete before prompting TOS.
        } else if (showTermsOfService) {
            if (location.pathname !== '/terms_of_service') {
                return <Redirect to={'/terms_of_service?redirect_to=' + encodeURIComponent(location.pathname)}/>;
            }
        }

        return children;
    }

    onFocusListener(): void {
        GlobalActions.emitBrowserFocus(true);
    }

    onBlurListener(): void {
        GlobalActions.emitBrowserFocus(false);
    }

    // listen for messages from the desktop app
    onDesktopMessageListener = ({origin, data: {type, message = {}} = {}}: DesktopMessageListener = {}): void => {
        const {currentUser, actions} = this.props;
        if (!currentUser) {
            return;
        }
        if (origin !== window.location.origin) {
            return;
        }

        switch (type) {
        case 'register-desktop': {
            const {version} = message;
            if (!(window as any).desktop) {
                (window as any).desktop = {};
            }
            (window as any).desktop.version = semver.valid(semver.coerce(version));
            break;
        }
        case 'user-activity-update': {
            const {userIsActive, manual} = message;

            // update the server with the users current away status
            if (userIsActive === true || userIsActive === false) {
                WebSocketClient.userUpdateActiveStatus(userIsActive, manual, undefined);
            }
            break;
        }
        case 'notification-clicked': {
            const {channel, teamId} = message;
            window.focus();

            // navigate to the appropriate channel
            actions.getChannelURLAction(channel, teamId);
            break;
        }
        }
    }

    handleBackSpace = (e: KeyboardEvent): void => {
        const excludedElements = ['input', 'textarea'];

        if (e.which === BACKSPACE_CHAR && !(excludedElements.includes((e.target as any).tagName.toLowerCase()))) {
            e.preventDefault();
        }
    }

    handleBeforeUnload = (): void => {
        // remove the event listener to prevent getting stuck in a loop
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        if (document.cookie.indexOf('MMUSERID=') > -1) {
            viewChannel('', this.props.currentChannelId || '')(dispatch, getState);
        }
        WebSocketActions.close();
    }
}
