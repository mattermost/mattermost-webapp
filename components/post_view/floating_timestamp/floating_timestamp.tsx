// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';

import RecentDate from 'components/recent_date';

type Props = {
    isScrolling: boolean;
    isMobile: boolean;
    createAt: Date | number;
    toastPresent: boolean;
    isRhsPost: boolean;
}

export default class FloatingTimestamp extends React.PureComponent<Props> {
    render() {
        const {isMobile, createAt, isScrolling, isRhsPost, toastPresent} = this.props;

        if (!isMobile || createAt === 0) {
            return null;
        }

        const dateString = (
            <RecentDate
                value={createAt}
            />
        );

        const classes = classNames('post-list__timestamp', {
            scrolling: isScrolling,
            rhs: isRhsPost,
            toastAdjustment: toastPresent,
        });

        return (
            <div
                className={classes}
                data-testid='floatingTimestamp'
            >
                <div>
                    <span>{dateString}</span>
                </div>
            </div>
        );
    }
}
