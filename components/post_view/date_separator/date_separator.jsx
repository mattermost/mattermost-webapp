// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import Timestamp, {RelativeRanges} from 'components/timestamp';

import BasicSeparator from 'components/widgets/separator/basic-separator';

const DATE_RANGES = [
    RelativeRanges.TODAY_TITLE_CASE,
    RelativeRanges.YESTERDAY_TITLE_CASE,
];

export default class DateSeparator extends React.PureComponent {
    static propTypes = {
        date: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.instanceOf(Date),
        ]).isRequired,
    }

    render() {
        return (
            <BasicSeparator>
                <Timestamp
                    value={this.props.date}
                    useTime={false}
                    ranges={DATE_RANGES}
                />
            </BasicSeparator>
        );
    }
}
