// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {General} from 'mattermost-redux/constants';

import {localizeMessage, isMobile} from 'utils/utils.jsx';
import ActivityLog from 'components/activity_log_modal/components/activity_log.jsx';
import LoadingScreen from 'components/loading_screen.jsx';

export default class ActivityLogModal extends React.PureComponent {
    static propTypes = {

        /**
         * The current user id
         */
        currentUserId: PropTypes.string.isRequired,

        /**
         * Current user's sessions
         */
        sessions: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.object,
        ]).isRequired,

        /**
         * Current user's locale
         */
        locale: PropTypes.string.isRequired,

        /**
         * Function that's called when user closes the modal
         */
        onHide: PropTypes.func.isRequired,
        actions: PropTypes.shape({

            /**
             * Function to refresh sessions from server
             */
            getSessions: PropTypes.func.isRequired,

            /**
             * Function to revoke a particular session
             */
            revokeSession: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            moreInfo: [],
            show: true,
        };
    }

    submitRevoke = (altId, e) => {
        e.preventDefault();
        var modalContent = $(e.target).closest('.modal-content');
        modalContent.addClass('animation--highlight');
        setTimeout(() => {
            modalContent.removeClass('animation--highlight');
        }, 1500);
        this.props.actions.revokeSession(this.props.currentUserId, altId).then(() => {
            this.props.actions.getSessions(this.props.currentUserId);
        });
    }

    onShow = () => {
        this.props.actions.getSessions(this.props.currentUserId);
        if (!isMobile()) {
            $('.modal-body').perfectScrollbar();
        }
    }

    onHide = () => {
        this.setState({show: false});
    }

    componentDidMount() {
        this.onShow();
    }

    handleMoreInfo = (index) => {
        const newMoreInfo = this.state.moreInfo;
        newMoreInfo[index] = true;
        this.setState({moreInfo: newMoreInfo});
    }

    isMobileSession = (session) => {
        return session.device_id && (session.device_id.includes('apple') || session.device_id.includes('android'));
    };

    mobileSessionInfo = (session) => {
        let deviceTypeId;
        let deviceTypeMessage;
        let devicePicture;
        let deviceTitle;

        if (session.device_id.includes('apple')) {
            devicePicture = 'fa fa-apple';
            deviceTitle = localizeMessage('device_icons.apple', 'Apple Icon');
            deviceTypeId = 'activity_log_modal.iphoneNativeClassicApp';
            deviceTypeMessage = 'iPhone Native Classic App';

            if (session.device_id.includes(General.PUSH_NOTIFY_APPLE_REACT_NATIVE)) {
                deviceTypeId = 'activity_log_modal.iphoneNativeApp';
                deviceTypeMessage = 'iPhone Native App';
            }
        } else if (session.device_id.includes('android')) {
            devicePicture = 'fa fa-android';
            deviceTitle = localizeMessage('device_icons.android', 'Android Icon');
            deviceTypeId = 'activity_log_modal.androidNativeClassicApp';
            deviceTypeMessage = 'Android Native Classic App';

            if (session.device_id.includes(General.PUSH_NOTIFY_ANDROID_REACT_NATIVE)) {
                deviceTypeId = 'activity_log_modal.androidNativeApp';
                deviceTypeMessage = 'Android Native App';
            }
        }

        return {
            devicePicture,
            deviceTitle,
            devicePlatform: (
                <FormattedMessage
                    id={deviceTypeId}
                    defaultMessage={deviceTypeMessage}
                />
            ),
        };
    };

    render() {
        let content;
        if (this.props.sessions.loading) {
            content = <LoadingScreen/>;
        } else {
            const activityList = this.props.sessions.reduce((array, currentSession, index) => {
                const lastAccessTime = new Date(currentSession.last_activity_at);
                const firstAccessTime = new Date(currentSession.create_at);
                let devicePlatform = currentSession.props.platform;
                let devicePicture = '';
                let deviceTitle = '';

                if (currentSession.props.type === 'UserAccessToken') {
                    return array;
                }

                if (currentSession.props.platform === 'Windows') {
                    devicePicture = 'fa fa-windows';
                    deviceTitle = localizeMessage('device_icons.windows', 'Windows Icon');
                } else if (this.isMobileSession(currentSession)) {
                    const sessionInfo = this.mobileSessionInfo(currentSession);
                    devicePicture = sessionInfo.devicePicture;
                    devicePlatform = sessionInfo.devicePlatform;
                } else if (currentSession.props.platform === 'Macintosh' ||
                    currentSession.props.platform === 'iPhone') {
                    devicePicture = 'fa fa-apple';
                    deviceTitle = localizeMessage('device_icons.apple', 'Apple Icon');
                } else if (currentSession.props.platform === 'Linux') {
                    if (currentSession.props.os.indexOf('Android') >= 0) {
                        devicePlatform = (
                            <FormattedMessage
                                id='activity_log_modal.android'
                                defaultMessage='Android'
                            />
                        );
                        devicePicture = 'fa fa-android';
                        deviceTitle = localizeMessage('device_icons.android', 'Android Icon');
                    } else {
                        devicePicture = 'fa fa-linux';
                        deviceTitle = localizeMessage('device_icons.linux', 'Linux Icon');
                    }
                } else if (currentSession.props.os.indexOf('Linux') !== -1) {
                    devicePicture = 'fa fa-linux';
                    deviceTitle = localizeMessage('device_icons.linux', 'Linux Icon');
                }

                if (currentSession.props.browser.indexOf('Desktop App') !== -1) {
                    devicePlatform = (
                        <FormattedMessage
                            id='activity_log_modal.desktop'
                            defaultMessage='Native Desktop App'
                        />
                    );
                }

                const moreInfo = typeof this.state.moreInfo[index] !== 'undefined';

                array.push(
                    <ActivityLog
                        key={currentSession.id}
                        index={index}
                        locale={this.props.locale}
                        currentSession={currentSession}
                        lastAccessTime={lastAccessTime}
                        firstAccessTime={firstAccessTime}
                        devicePlatform={devicePlatform}
                        devicePicture={devicePicture}
                        deviceTitle={deviceTitle}
                        moreInfo={moreInfo}
                        handleMoreInfo={this.handleMoreInfo}
                        submitRevoke={this.submitRevoke}
                    />
                );
                return array;
            }, []);

            content = <form role='form'>{activityList}</form>;
        }

        return (
            <Modal
                dialogClassName='modal--scroll'
                show={this.state.show}
                onHide={this.onHide}
                onExited={this.props.onHide}
                bsSize='large'
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        <FormattedMessage
                            id='activity_log.activeSessions'
                            defaultMessage='Active Sessions'
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body ref='modalBody'>
                    <p className='session-help-text'>
                        <FormattedMessage
                            id='activity_log.sessionsDescription'
                            defaultMessage="Sessions are created when you log in to a new browser on a device. Sessions let you use Mattermost without having to log in again for a time period specified by the System Admin. If you want to log out sooner, use the 'Logout' button below to end a session."
                        />
                    </p>
                    {content}
                </Modal.Body>
            </Modal>
        );
    }
}
