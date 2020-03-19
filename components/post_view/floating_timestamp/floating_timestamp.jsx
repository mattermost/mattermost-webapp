// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import RecentDate from 'components/recent_date';

export default class FloatingTimestamp extends React.PureComponent {
    static propTypes = {
        isScrolling: PropTypes.bool.isRequired,
        isMobile: PropTypes.bool,
        createAt: PropTypes.oneOfType([
            PropTypes.instanceOf(Date),
            PropTypes.number,
        ]).isRequired,
        toastPresent: PropTypes.bool,
        isRhsPost: PropTypes.bool,
    }

    render() {
        const {isMobile, createAt, isScrolling, isRhsPost, toastPresent} = this.props;

        if (!isMobile) {
            return null;
        }

        if (createAt === 0) {
            return null;
        }

        const dateString = (
            <RecentDate
                value={createAt}
                weekday='short'
                day='2-digit'
                month='short'
                year='numeric'
            />
        );

        let className = 'post-list__timestamp';
        if (isScrolling) {
            className += ' scrolling';
        }

        if (isRhsPost) {
            className += ' rhs';
        }

        return (
            <div
                className={className}
                style={toastPresent ? {top: '50px'} : null}
                data-testid='floatingTimestamp'
            >
                <div>
                    <span>{dateString}</span>
                </div>
            </div>
        );
    }
}
