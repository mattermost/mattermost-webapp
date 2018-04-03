// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {Redirect} from 'react-router';
import {viewChannel} from 'mattermost-redux/actions/channels';

import * as GlobalActions from 'actions/global_actions.jsx';
import * as WebSocketActions from 'actions/websocket_actions.jsx';
import 'stores/emoji_store.jsx';
import UserStore from 'stores/user_store.jsx';
import ChannelStore from 'stores/channel_store.jsx';
import ErrorStore from 'stores/error_store.jsx';
import * as UserAgent from 'utils/user_agent.jsx';
import * as Utils from 'utils/utils.jsx';
import LoadingScreen from 'components/loading_screen.jsx';
import {getBrowserTimezone} from 'utils/timezone.jsx';
import store from 'stores/redux_store.jsx';

const dispatch = store.dispatch;
const getState = store.getState;

const BACKSPACE_CHAR = 8;

export default class LoggedIn extends React.Component {
    constructor(params) {
        super(params);

        this.onUserChanged = this.onUserChanged.bind(this);

        this.state = {
            user: UserStore.getCurrentUser(),
        };
        document.getElementById('root').className += ' channel-view';
    }

    isValidState() {
        return this.state.user != null;
    }

    onUserChanged() {
        // Grab the current user
        const user = UserStore.getCurrentUser();

        if (!Utils.areObjectsEqual(this.state.user, user)) {
            this.setState({
                user,
            });
        }
    }

    componentWillMount() {
        ErrorStore.clearLastError();
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
                    viewChannel('', ChannelStore.getCurrentId() || '')(dispatch, getState);
                }
                WebSocketActions.close();
            }
        );

        // Listen for user
        UserStore.addChangeListener(this.onUserChanged);

        // Listen for focused tab/window state
        window.addEventListener('focus', this.onFocusListener);
        window.addEventListener('blur', this.onBlurListener);

        // Because current CSS requires the root tag to have specific stuff

        // Device tracking setup
        if (UserAgent.isIos()) {
            $('body').addClass('ios');
        } else if (UserAgent.isAndroid()) {
            $('body').addClass('android');
        }

        if (!this.state.user) {
            $('#root').attr('class', '');
            GlobalActions.emitUserLoggedOutEvent('/login?redirect_to=' + encodeURIComponent(this.props.location.pathname));
        }

        $('body').on('mouseenter mouseleave', '.post', function mouseOver(ev) {
            if (ev.type === 'mouseenter') {
                $(this).parent('div').prev('.date-separator, .new-separator').addClass('hovered--after');
                $(this).parent('div').next('.date-separator, .new-separator').addClass('hovered--before');
            } else {
                $(this).parent('div').prev('.date-separator, .new-separator').removeClass('hovered--after');
                $(this).parent('div').next('.date-separator, .new-separator').removeClass('hovered--before');
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

        $('body').on('mouseenter mouseleave', '.post.post--comment.same--root', function mouseOver(ev) {
            if (ev.type === 'mouseenter') {
                $(this).parent('div').prev('.date-separator, .new-separator').addClass('hovered--comment');
                $(this).parent('div').next('.date-separator, .new-separator').addClass('hovered--comment');
            } else {
                $(this).parent('div').prev('.date-separator, .new-separator').removeClass('hovered--comment');
                $(this).parent('div').next('.date-separator, .new-separator').removeClass('hovered--comment');
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
        UserStore.removeChangeListener(this.onUserChanged);

        $('body').off('click.userpopover');
        $('body').off('mouseenter mouseleave', '.post');
        $('body').off('mouseenter mouseleave', '.post.post--comment.same--root');

        $('.modal').off('show.bs.modal');

        $(window).off('keydown.preventBackspace');

        // Listen for focussed tab/window state
        window.removeEventListener('focus', this.onFocusListener);
        window.removeEventListener('blur', this.onBlurListener);
    }

    render() {
        if (!this.isValidState()) {
            return <LoadingScreen/>;
        }

        if (this.props.location.pathname !== '/mfa/setup' && this.props.mfaRequired) {
            return <Redirect to={'/mfa/setup'}/>;
        }

        return this.props.children;
    }

    onFocusListener() {
        GlobalActions.emitBrowserFocus(true);
    }

    onBlurListener() {
        GlobalActions.emitBrowserFocus(false);
    }
}

LoggedIn.propTypes = {
    children: PropTypes.object,
    mfaRequired: PropTypes.bool.isRequired,
    enableTimezone: PropTypes.bool.isRequired,
    actions: PropTypes.shape({
        autoUpdateTimezone: PropTypes.func.isRequired,
    }).isRequired,
};
