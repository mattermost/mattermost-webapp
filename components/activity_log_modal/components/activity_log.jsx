// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedDate, FormattedMessage, FormattedTime} from 'react-intl';

import {getMonthLong} from 'utils/i18n';

import MoreInfo from './more_info.jsx';

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
         * The session's last access time
         */
        lastAccessTime: PropTypes.instanceOf(Date).isRequired,

        /**
         * The session's first access time
         */
        firstAccessTime: PropTypes.instanceOf(Date).isRequired,

        /**
         * The session's device platform
         */
        devicePlatform: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.element,
        ]),

        /**
         * The session's device picture
         */
        devicePicture: PropTypes.string.isRequired,

        /**
         * The session's last access time
         */
        deviceTitle: PropTypes.string.isRequired,

        /**
         * Boolean indicating whether to show more info about the session
         */
        moreInfo: PropTypes.bool.isRequired,

        /**
         * Function to show more info
         */
        handleMoreInfo: PropTypes.func.isRequired,

        /**
         * Function to revoke session
         */
        submitRevoke: PropTypes.func.isRequired,
    }

    handleMoreInfo = () => {
        this.props.handleMoreInfo(this.props.index);
    }

    submitRevoke = (e) => {
        this.props.submitRevoke(this.props.currentSession.id, e);
    }

    render() {
        const {
            index,
            locale,
            currentSession,
            lastAccessTime,
            firstAccessTime,
            devicePlatform,
            devicePicture,
            deviceTitle,
            moreInfo,
        } = this.props;

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
                            firstAccessTime={firstAccessTime}
                            moreInfo={moreInfo}
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
                            defaultMessage='Logout'
                        />
                    </button>
                </div>
            </div>
        );
    }
}
