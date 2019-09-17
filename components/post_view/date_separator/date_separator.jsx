// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedDate} from 'react-intl';

import Separator from 'components/widgets/separator/separator';

export default class DateSeparator extends React.PureComponent {
    static propTypes = {
        date: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.instanceOf(Date),
        ]).isRequired,
        timeZone: PropTypes.string,
        enableTimezone: PropTypes.bool,
    }

    render() {
        const {
            date,
            enableTimezone,
            timeZone,
        } = this.props;
        const timezoneProps = enableTimezone && timeZone ? {timeZone} : {};

        return (
            <Separator className='date-separator'>
                <FormattedDate
                    {...timezoneProps}
                    value={date}
                    weekday='short'
                    month='short'
                    day='2-digit'
                    year='numeric'
                />
            </Separator>
        );
    }
}
