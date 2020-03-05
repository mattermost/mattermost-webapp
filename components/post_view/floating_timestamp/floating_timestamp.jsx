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
        isRhsPost: PropTypes.bool,
        stylesOverride: PropTypes.object,
    }

    render() {
        if (!this.props.isMobile) {
            return null;
        }

        if (this.props.createAt === 0) {
            return null;
        }

        const dateString = (
            <RecentDate
                value={this.props.createAt}
                weekday='short'
                day='2-digit'
                month='short'
                year='numeric'
            />
        );

        let className = 'post-list__timestamp';
        if (this.props.isScrolling) {
            className += ' scrolling';
        }

        if (this.props.isRhsPost) {
            className += ' rhs';
        }

        return (
            <div
                className={className}
                style={this.props.stylesOverride}
                data-testid='floatingTimestamp'
            >
                <div>
                    <span>{dateString}</span>
                </div>
            </div>
        );
    }
}
