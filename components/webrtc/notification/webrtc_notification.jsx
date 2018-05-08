// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import * as GlobalActions from 'actions/global_actions.jsx';
import * as WebrtcActions from 'actions/webrtc_actions.jsx';
import UserStore from 'stores/user_store.jsx';
import WebrtcStore from 'stores/webrtc_store.jsx';
import WebSocketClient from 'client/web_websocket_client.jsx';
import {WebrtcActionTypes} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';
import ring from 'images/ring.mp3';

export default class WebrtcNotification extends React.Component {
    static propTypes = {
        enableWebrtc: PropTypes.bool.isRequired,
        isRhsOpen: PropTypes.bool.isRequired,
        actions: PropTypes.shape({
            closeRhs: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor() {
        super();

        this.mounted = false;

        this.closeNotification = this.closeNotification.bind(this);
        this.onIncomingCall = this.onIncomingCall.bind(this);
        this.onCancelCall = this.onCancelCall.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleAnswer = this.handleAnswer.bind(this);
        this.handleTimeout = this.handleTimeout.bind(this);
        this.stopRinging = this.stopRinging.bind(this);

        this.state = {
            userCalling: null,
        };
    }

    componentDidMount() {
        WebrtcStore.addNotifyListener(this.onIncomingCall);
        WebrtcStore.addChangedListener(this.onCancelCall);
        this.mounted = true;
    }

    componentWillUnmount() {
        WebrtcStore.removeNotifyListener(this.onIncomingCall);
        WebrtcStore.removeChangedListener(this.onCancelCall);
        if (this.refs.ring) {
            this.refs.ring.removeListener('ended', this.handleTimeout);
        }
        this.mounted = false;
    }

    componentDidUpdate() {
        if (this.state.userCalling) {
            this.refs.ring.addEventListener('ended', this.handleTimeout);
        }
    }

    closeNotification() {
        this.setState({
            userCalling: null,
        });
    }

    stopRinging() {
        if (this.refs.ring) {
            this.refs.ring.pause();
            this.refs.ring.currentTime = 0;
        }
        this.setState({userCalling: null});
    }

    closeRightHandSide = (e) => {
        e.preventDefault();
        GlobalActions.emitCloseRightHandSide();
        this.props.actions.closeRhs();
    }

    onIncomingCall(incoming) {
        if (this.mounted) {
            const userId = incoming.from_user_id;

            if (this.props.enableWebrtc) {
                if (WebrtcStore.isBusy()) {
                    WebSocketClient.sendMessage('webrtc', {
                        action: WebrtcActionTypes.BUSY,
                        from_user_id: UserStore.getCurrentId(),
                        to_user_id: userId,
                    });
                    this.stopRinging();
                } else if (Utils.isUserMediaAvailable()) {
                    WebrtcStore.setVideoCallWith(userId);
                    this.setState({
                        userCalling: UserStore.getProfile(userId),
                    });
                } else {
                    WebSocketClient.sendMessage('webrtc', {
                        action: WebrtcActionTypes.UNSUPPORTED,
                        from_user_id: UserStore.getCurrentId(),
                        to_user_id: userId,
                    });
                    this.stopRinging();
                }
            } else {
                WebSocketClient.sendMessage('webrtc', {
                    action: WebrtcActionTypes.DISABLED,
                    from_user_id: UserStore.getCurrentId(),
                    to_user_id: userId,
                });
                this.stopRinging();
            }
        }
    }

    onCancelCall(message) {
        if (message) {
            if (message.action !== WebrtcActionTypes.CANCEL) {
                return;
            }
            if (this.state.userCalling) {
                if (message.from_user_uid === UserStore.getCurrentId() && message.calling_user_id === this.state.userCalling.id) {
                    // Allow cancel message from ourselves when the calling user_id matches our current state.
                } else if (message.from_user_id !== this.state.userCalling.id) {
                    // Ignore cancel messages from user_ids which are not in our current state.
                    return;
                }
            }
        }

        WebrtcStore.setVideoCallWith(null);
        this.closeNotification();
    }

    handleTimeout() {
        WebSocketClient.sendMessage('webrtc', {
            action: WebrtcActionTypes.NO_ANSWER,
            from_user_id: UserStore.getCurrentId(),
            to_user_id: this.state.userCalling.id,
        });

        this.onCancelCall();
    }

    handleAnswer(e) {
        if (e) {
            e.preventDefault();
        }

        const caller = this.state.userCalling;
        if (caller) {
            const callerId = caller.id;
            const currentUserId = UserStore.getCurrentId();
            const message = {
                action: WebrtcActionTypes.ANSWER,
                from_user_id: currentUserId,
                to_user_id: callerId,
            };

            GlobalActions.emitCloseRightHandSide();
            WebrtcActions.initWebrtc(callerId, false);
            WebSocketClient.sendMessage('webrtc', message);

            // delay till next tick (this will give time to listen for events
            setTimeout(() => {
                //we switch from and to user to handle the event locally
                message.from_user_id = callerId;
                message.to_user_id = currentUserId;
                WebrtcActions.handle(message);

                // Notify current users sessions.
                WebSocketClient.sendMessage('webrtc', {
                    action: WebrtcActionTypes.CANCEL,
                    from_user_id: currentUserId,
                    to_user_id: currentUserId,
                    calling_user_id: callerId,
                });
            }, 0);

            this.closeNotification();
        }
    }

    handleClose(e) {
        if (e) {
            e.preventDefault();
        }
        if (this.state.userCalling) {
            // Notify current users sessions.
            WebSocketClient.sendMessage('webrtc', {
                action: WebrtcActionTypes.CANCEL,
                from_user_id: UserStore.getCurrentId(),
                to_user_id: UserStore.getCurrentId(),
                calling_user_id: this.state.userCalling.id,
            });

            WebSocketClient.sendMessage('webrtc', {
                action: WebrtcActionTypes.DECLINE,
                from_user_id: UserStore.getCurrentId(),
                to_user_id: this.state.userCalling.id,
            });
        }

        this.onCancelCall();
    }

    render() {
        const user = this.state.userCalling;
        if (user) {
            const username = Utils.getDisplayNameByUserId(user.id);
            const profileImgSrc = Utils.imageURLForUser(user);
            const profileImg = (
                <img
                    className='user-popover__image'
                    src={profileImgSrc}
                    height='128'
                    width='128'
                    key='user-popover-image'
                />
            );
            const answerBtn = (
                <svg
                    className='webrtc-icons__pickup'
                    xmlns='http://www.w3.org/2000/svg'
                    width='48'
                    height='48'
                    viewBox='-10 -10 68 68'
                    onClick={this.handleAnswer}
                >
                    <circle
                        cx='24'
                        cy='24'
                        r='34'
                    >
                        <title>
                            <FormattedMessage
                                id='webrtc.notification.answer'
                                defaultMessage='Answer'
                            />
                        </title>
                    </circle>
                    <path
                        transform='translate(-10,-10)'
                        fill='#fff'
                        d='M29.854,37.627c1.723,1.904 3.679,3.468 5.793,4.684l3.683,-3.334c0.469,-0.424 1.119,-0.517 1.669,-0.302c1.628,0.63 3.331,1.021 5.056,1.174c0.401,0.026 0.795,0.199 1.09,0.525c0.295,0.326 0.433,0.741 0.407,1.153l-0.279,5.593c-0.02,0.418 -0.199,0.817 -0.525,1.112c-0.326,0.296 -0.741,0.434 -1.159,0.413c-6.704,-0.504 -13.238,-3.491 -18.108,-8.87c-4.869,-5.38 -7.192,-12.179 -7.028,-18.899c0.015,-0.413 0.199,-0.817 0.526,-1.113c0.326,-0.295 0.74,-0.433 1.153,-0.407l5.593,0.279c0.407,0.02 0.812,0.193 1.107,0.519c0.29,0.32 0.428,0.735 0.413,1.137c-0.018,1.732 0.202,3.464 0.667,5.147c0.159,0.569 0.003,1.207 -0.466,1.631l-3.683,3.334c1.005,2.219 2.368,4.32 4.091,6.224Z'
                    />
                </svg>
            );

            const rejectBtn = (
                <svg
                    className='webrtc-icons__cancel'
                    xmlns='http://www.w3.org/2000/svg'
                    width='48'
                    height='48'
                    viewBox='-10 -10 68 68'
                    onClick={this.handleClose}
                >
                    <circle
                        cx='24'
                        cy='24'
                        r='34'
                    >
                        <title>
                            <FormattedMessage
                                id='webrtc.notification.decline'
                                defaultMessage='Decline'
                            />
                        </title>
                    </circle>
                    <path
                        transform='scale(0.7), translate(11,10)'
                        d='M24 18c-3.21 0-6.3.5-9.2 1.44v6.21c0 .79-.46 1.47-1.12 1.8-1.95.98-3.74 2.23-5.33 3.7-.36.35-.85.57-1.4.57-.55 0-1.05-.22-1.41-.59L.59 26.18c-.37-.37-.59-.87-.59-1.42 0-.55.22-1.05.59-1.42C6.68 17.55 14.93 14 24 14s17.32 3.55 23.41 9.34c.37.36.59.87.59 1.42 0 .55-.22 1.05-.59 1.41l-4.95 4.95c-.36.36-.86.59-1.41.59-.54 0-1.04-.22-1.4-.57-1.59-1.47-3.38-2.72-5.33-3.7-.66-.33-1.12-1.01-1.12-1.8v-6.21C30.3 18.5 27.21 18 24 18z'
                        fill='white'
                    />
                </svg>
            );

            const msg = (
                <div>
                    <FormattedMessage
                        id='webrtc.notification.incoming_call'
                        defaultMessage='{username} is calling you.'
                        values={{
                            username,
                        }}
                    />
                    <div
                        className='webrtc-buttons webrtc-icons active'
                        style={style.buttons}
                    >
                        {answerBtn}
                        {rejectBtn}
                    </div>
                </div>
            );

            return (
                <div className='webrtc-notification'>
                    <audio
                        ref='ring'
                        src={ring}
                        autoPlay={true}
                    />
                    <div>
                        {profileImg}
                    </div>
                    {msg}
                </div>
            );
        } else if (this.props.isRhsOpen && WebrtcStore.isBusy()) {
            return (
                <div
                    className='webrtc__notification--rhs'
                    onClick={this.closeRightHandSide}
                >
                    <i className='fa fa-phone'/>
                    <FormattedMessage
                        id='webrtc.notification.returnToCall'
                        defaultMessage='Return to ongoing call with {username}'
                        values={{
                            username: Utils.getDisplayNameByUserId(WebrtcStore.getVideoCallWith()),
                        }}
                    />
                </div>
            );
        }

        return <div/>;
    }
}

const style = {
    buttons: {marginTop: 5},
};
