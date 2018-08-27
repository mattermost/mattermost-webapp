// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedDate, FormattedMessage, FormattedTime} from 'react-intl';

import {getMonthLong} from 'utils/i18n';

export default function MoreInfo({
    locale,
    currentSession,
    moreInfo,
    handleMoreInfo,
}) {
    if (moreInfo) {
        const firstAccessTime = new Date(currentSession.create_at);

        return (
            <div>
                <div>
                    <FormattedMessage
                        id='activity_log.firstTime'
                        defaultMessage='First time active: {date}, {time}'
                        values={{
                            date: (
                                <FormattedDate
                                    value={firstAccessTime}
                                    day='2-digit'
                                    month={getMonthLong(locale)}
                                    year='numeric'
                                />
                            ),
                            time: (
                                <FormattedTime
                                    value={firstAccessTime}
                                    hour='2-digit'
                                    minute='2-digit'
                                />
                            ),
                        }}
                    />
                </div>
                <div>
                    <FormattedMessage
                        id='activity_log.os'
                        defaultMessage='OS: {os}'
                        values={{
                            os: currentSession.props.os,
                        }}
                    />
                </div>
                <div>
                    <FormattedMessage
                        id='activity_log.browser'
                        defaultMessage='Browser: {browser}'
                        values={{
                            browser: currentSession.props.browser,
                        }}
                    />
                </div>
                <div>
                    <FormattedMessage
                        id='activity_log.sessionId'
                        defaultMessage='Session ID: {id}'
                        values={{
                            id: currentSession.id,
                        }}
                    />
                </div>
            </div>
        );
    }

    return (
        <a
            className='theme'
            href='#'
            onClick={handleMoreInfo}
        >
            <FormattedMessage
                id='activity_log.moreInfo'
                defaultMessage='More info'
            />
        </a>
    );
}

MoreInfo.propTypes = {
    locale: PropTypes.string.isRequired,
    currentSession: PropTypes.object.isRequired,
    handleMoreInfo: PropTypes.func.isRequired,
    moreInfo: PropTypes.bool.isRequired,
};
