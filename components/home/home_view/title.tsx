// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl, FormattedDate, FormattedMessage, FormattedTime} from 'react-intl';
import {useSelector} from 'react-redux';

import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getUserTimezone} from 'mattermost-redux/selectors/entities/timezone';
import {getUserCurrentTimezone} from 'mattermost-redux/utils/timezone_utils';

import {getCurrentLocale} from 'selectors/i18n';
import {t, getMonthLong} from 'utils/i18n';
import {getCurrentDateForTimezone, getBrowserTimezone} from 'utils/timezone';
import {GlobalState} from 'types/store';

import './title.scss';

const Title = () => {
    const {formatMessage} = useIntl();
    const user = useSelector(getCurrentUser);
    const locale = useSelector(getCurrentLocale);
    const userTimezone = useSelector((state: GlobalState) => getUserTimezone(state, user.id));
    let userCurrentTimezone = getUserCurrentTimezone(userTimezone);
    if (userCurrentTimezone == null) {
        userCurrentTimezone = getBrowserTimezone();
    }
    let date;
    
    if (userCurrentTimezone) {
        date = getCurrentDateForTimezone(userCurrentTimezone);
    } else {
        date = new Date();
    }

    return (
        <div className='HomeTitle'>
            <h1>
                {`${formatMessage({id: t('home.title'), defaultMessage: 'Good Morning,'})} ${user.first_name || ('@' + user.username)}`}
            </h1>
            <h2>
                <FormattedDate
                    value={date}
                    weekday='long'
                    day='numeric'
                    month={getMonthLong(locale)}
                    year='numeric'
                />
            </h2>
        </div>
    );
}

export default Title;
