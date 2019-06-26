// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {Redirect} from 'react-router';
import {viewChannel} from 'mattermost-redux/actions/channels';

import * as GlobalActions from 'actions/global_actions.jsx';
import * as WebSocketActions from 'actions/websocket_actions.jsx';
import * as UserAgent from 'utils/user_agent.jsx';
import LoadingScreen from 'components/loading_screen.jsx';
import {getBrowserTimezone} from 'utils/timezone.jsx';
import store from 'stores/redux_store.jsx';
import {webappConnector} from 'utils/webapp_connector';
import WebSocketClient from 'client/web_websocket_client.jsx';

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
        $(window).on('beforeunload',
            () => {
                // Turn off to prevent getting stuck in a loop
                $(window).off('beforeunload');
                if (document.cookie.indexOf('MMUSERID=') > -1) {
                    viewChannel('', this.props.currentChannelId || '')(dispatch, getState);
                }
                WebSocketActions.close();
            }
        );

        // Listen for focused tab/window state
        window.addEventListener('focus', this.onFocusListener);
        window.addEventListener('blur', this.onBlurListener);

        // Listen for user activity updates from external sources via the webapp connector
        if (webappConnector.active) {
            webappConnector.on('user-activity-update', this.handleUserActivityUpdates);
        }

        // Because current CSS requires the root tag to have specific stuff

        // Device tracking setup
        if (UserAgent.isIos()) {
            $('body').addClass('ios');
        } else if (UserAgent.isAndroid()) {
            $('body').addClass('android');
        }

        if (!this.props.currentUser) {
            $('#root').attr('class', '');
            GlobalActions.emitUserLoggedOutEvent('/login?redirect_to=' + encodeURIComponent(this.props.location.pathname), true, false);
        }

        $('body').on('mouseenter mouseleave', ':not(.post-list__dynamic) .post', function mouseOver(ev) {
            if (ev.type === 'mouseenter') {
                $(this).prev('.date-separator, .new-separator').addClass('hovered--after');
                $(this).next('.date-separator, .new-separator').addClass('hovered--before');
            } else {
                $(this).prev('.date-separator, .new-separator').removeClass('hovered--after');
                $(this).next('.date-separator, .new-separator').removeClass('hovered--before');
            }
        });

        $('body').on('mouseenter mouseleave', '.search-item__container .post', function mouseOver(ev) {
            if (ev.type === 'mouseenter') {
                $(this).closest('.search-item__container').find('.date-separator').addClass('hovered--after');
                $(this).closest('.search-item__container').next('div').find('.date-separator').addClass('hovered--before');
            } else {
                $(this).closest('.search-item__container').find('.date-separator').removeClass('hovered--after');
                $(this).closest('.search-item__container').next('div').find('.date-separator').removeClass('hovered--before');
            }
        });

        $('body').on('mouseenter mouseleave', ':not(.post-list__dynamic) .post.post--comment.same--root', function mouseOver(ev) {
            if (ev.type === 'mouseenter') {
                $(this).prev('.date-separator, .new-separator').addClass('hovered--comment');
                $(this).next('.date-separator, .new-separator').addClass('hovered--comment');
            } else {
                $(this).prev('.date-separator, .new-separator').removeClass('hovered--comment');
                $(this).next('.date-separator, .new-separator').removeClass('hovered--comment');
            }
        });

        // Prevent backspace from navigating back a page
        $(window).on('keydown.preventBackspace', (e) => {
            if (e.which === BACKSPACE_CHAR && !$(e.target).is('input, textarea')) {
                e.preventDefault();
            }
        });
    }

    componentWillUnmount() {
        WebSocketActions.close();

        $('body').off('click.userpopover');
        $('body').off('mouseenter mouseleave', '.post');
        $('body').off('mouseenter mouseleave', '.post.post--comment.same--root');

        $('.modal').off('show.bs.modal');

        $(window).off('keydown.preventBackspace');

        window.removeEventListener('focus', this.onFocusListener);
        window.removeEventListener('blur', this.onBlurListener);

        webappConnector.removeListener('user-activity-update', this.handleUserActivityUpdates);
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

    handleUserActivityUpdates = ({userIsActive, manual}) => {
        if (!this.props.currentUser) {
            return;
        }

        // update the server with the users current away status
        WebSocketClient.userUpdateActiveStatus(userIsActive, manual);
    }
}
