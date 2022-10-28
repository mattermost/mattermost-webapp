// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';

import {AlertOutlineIcon} from '@mattermost/compass-icons/components';

import StatisticCount from 'components/analytics/statistic_count';

import {calculateOverageUserActivated} from 'utils/overage_team';

type ActivatedUserCardProps = {
    seatsPurchased: number;
    activatedUsers: number | undefined;
}

export const ActivatedUserCard = ({activatedUsers, seatsPurchased}: ActivatedUserCardProps) => {
    const {isBetween5PercerntAnd10PercentPurchasedSeats, isOver10PercerntPurchasedSeats} = calculateOverageUserActivated({seatsPurchased, activeUsers: activatedUsers || 0});
    const showOverageWarning = isBetween5PercerntAnd10PercentPurchasedSeats || isOver10PercerntPurchasedSeats;

    let activeUserStatus: 'warning' | 'error' | undefined;
    if (isBetween5PercerntAnd10PercentPurchasedSeats) {
        activeUserStatus = 'warning';
    }

    if (isOver10PercerntPurchasedSeats) {
        activeUserStatus = 'error';
    }

    return (
        <StatisticCount
            title={
                <FormattedMessage
                    id='analytics.team.totalUsers'
                    defaultMessage='Total Active Users'
                />
            }
            icon='fa-users'
            status={activeUserStatus}
            count={activatedUsers}
            id='totalActiveUsers'
        >
            {showOverageWarning &&
            <div
                className={classNames({
                    team_statistics__message: true,
                    'team_statistics--warning': isBetween5PercerntAnd10PercentPurchasedSeats,
                    'team_statistics--error': isOver10PercerntPurchasedSeats,
                })}
            >
                <AlertOutlineIcon
                    size={14}
                />
                <FormattedMessage
                    id='analytics.team.overageUsersSeats'
                    defaultMessage='This exceedes total paid users'
                >
                    {(text) => <span>{text}</span>}
                </FormattedMessage>
            </div>}
        </StatisticCount>
    );
};
