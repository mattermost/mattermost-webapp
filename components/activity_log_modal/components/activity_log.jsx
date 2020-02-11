// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedDate, FormattedMessage, FormattedTime} from 'react-intl';
import {General} from 'mattermost-redux/constants';

import {localizeMessage} from 'utils/utils.jsx';
import {getMonthLong, t} from 'utils/i18n';

import MoreInfo from './more_info';

export default class ActivityLog extends React.PureComponent {
    static propTypes = {

        /**
         * The index of this instance within the list
         */
        index: PropTypes.number.isRequired,

        /**
         * The current locale of the user
         */
        locale: PropTypes.string.isRequired,

        /**
         * The session that's to be displayed
         */
        currentSession: PropTypes.object.isRequired,

        /**
         * Function to revoke session
         */
        submitRevoke: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            moreInfo: false,
        };
    }

    handleMoreInfo = () => {
        this.setState({moreInfo: true});
    }

    submitRevoke = (e) => {
        this.props.submitRevoke(this.props.currentSession.id, e);
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
            deviceTypeId = t('activity_log_modal.iphoneNativeClassicApp');
            deviceTypeMessage = 'iPhone Native Classic App';

            if (session.device_id.includes(General.PUSH_NOTIFY_APPLE_REACT_NATIVE)) {
                deviceTypeId = t('activity_log_modal.iphoneNativeApp');
                deviceTypeMessage = 'iPhone Native App';
            }
        } else if (session.device_id.includes('android')) {
            devicePicture = 'fa fa-android';
            deviceTitle = localizeMessage('device_icons.android', 'Android Icon');
            deviceTypeId = t('activity_log_modal.androidNativeClassicApp');
            deviceTypeMessage = 'Android Native Classic App';

            if (session.device_id.includes(General.PUSH_NOTIFY_ANDROID_REACT_NATIVE)) {
                deviceTypeId = t('activity_log_modal.androidNativeApp');
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
        const {
            index,
            locale,
            currentSession,
        } = this.props;

        const lastAccessTime = new Date(currentSession.last_activity_at);
        let devicePlatform = currentSession.props.platform;
        let devicePicture = '';
        let deviceTitle = '';

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

        return (
            <div
                key={'activityLogEntryKey' + index}
                className='activity-log__table'
            >
                <div className='activity-log__report'>
                    <div className='report__platform'>
                        <i
                            className={devicePicture}
                            title={deviceTitle}
                        />{devicePlatform}
                    </div>
                    <div className='report__info'>
                        <div>
                            <FormattedMessage
                                id='activity_log.lastActivity'
                                defaultMessage='Last activity: {date}, {time}'
                                values={{
                                    date: (
                                        <FormattedDate
                                            value={lastAccessTime}
                                            day='2-digit'
                                            month={getMonthLong(locale)}
                                            year='numeric'
                                        />
                                    ),
                                    time: (
                                        <FormattedTime
                                            value={lastAccessTime}
                                            hour='2-digit'
                                            minute='2-digit'
                                        />
                                    ),
                                }}
                            />
                        </div>
                        <MoreInfo
                            locale={locale}
                            currentSession={currentSession}
                            moreInfo={this.state.moreInfo}
                            handleMoreInfo={this.handleMoreInfo}
                        />
                    </div>
                </div>
                <div className='activity-log__action'>
                    <button
                        onClick={this.submitRevoke}
                        className='btn btn-primary'
                    >
                        <FormattedMessage
                            id='activity_log.logout'
                            defaultMessage='Log Out'
                        />
                    </button>
                </div>
            </div>
        );
    }
}
