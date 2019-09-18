// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedDate} from 'react-intl';

export default class FloatingTimestamp extends React.PureComponent {
    static propTypes = {
        isScrolling: PropTypes.bool.isRequired,
        isMobile: PropTypes.bool,
        createAt: PropTypes.oneOfType([
            PropTypes.instanceOf(Date),
            PropTypes.number,
        ]).isRequired,
        isRhsPost: PropTypes.bool,
    }

    render() {
        if (!this.props.isMobile) {
            return <noscript/>;
        }

        if (this.props.createAt === 0) {
            return <noscript/>;
        }

        const dateString = (
            <FormattedDate
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
            <div className={className}>
                <div>
                    <span>{dateString}</span>
                </div>
            </div>
        );
    }
}
