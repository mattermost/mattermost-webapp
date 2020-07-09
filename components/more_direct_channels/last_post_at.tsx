// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {FunctionComponent} from 'react';
import moment from 'moment-timezone';
import {FormattedMessage} from 'react-intl';

type LastPostAtProps = {
    lastPostAt?: number;
}
import {t} from 'utils/i18n';

export const LastPostAt: FunctionComponent<LastPostAtProps> = ({lastPostAt}: LastPostAtProps): JSX.Element | null => {
    if (!lastPostAt) {
        return null;
    }
    let messageId: string;
    let value: number;

    if (moment().diff(lastPostAt, 'years') > 0) {
        messageId = t('more_direct_channels.last.post.at.years');
        value = moment().diff(lastPostAt, 'years');
    } else if (moment().diff(lastPostAt, 'months') > 0) {
        messageId = t('more_direct_channels.last.post.at.months');
        value = moment().diff(lastPostAt, 'months');
    } else if (moment().diff(lastPostAt, 'days') > 0) {
        messageId = t('more_direct_channels.last.post.at.days');
        value = moment().diff(lastPostAt, 'days');
    } else if (moment().diff(lastPostAt, 'hours') > 0) {
        messageId = t('more_direct_channels.last.post.at.hours');
        value = moment().diff(lastPostAt, 'hours');
    } else {
        messageId = t('more_direct_channels.last.post.at.minutes');
        const minutes = moment().diff(lastPostAt, 'minutes');
        value = minutes || 1;
    }

    return (
        <div className='more-modal__last_post_at'>
            <FormattedMessage
                id={messageId}
                values={{value}}
            />
        </div>
    );
};