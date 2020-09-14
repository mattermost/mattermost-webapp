// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';
import classNames from 'classnames';

import {getConfig} from 'mattermost-redux/selectors/entities/general';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import {GlobalState} from 'types/store';

import './plan_details.scss';

type Props = {

};

const features = [
    '10 GB storage per user',
    '99.9% uptime',
    'Self-Service documentation and forum support',
    'Google, Gitlab, O365 & MFA Authentication',
    'Guest Accounts',
    'Unlimited Integrations',
];

const PlanDetails: React.FC<Props> = (props: Props) => {
    const userCount = useSelector((state: GlobalState) => state.entities.admin.analytics!.TOTAL_USERS) as number;
    const userLimit = parseInt(useSelector((state: GlobalState) => getConfig(state).ExperimentalCloudUserLimit) || '0', 10);

    let userCountDisplay;
    if (userLimit) {
        userCountDisplay = (
            <div
                className={classNames('PlanDetails__userCount', {
                    withinLimit: (userLimit - userCount) <= 5,
                    overLimit: userCount > userLimit,
                })}
            >
                <FormattedMarkdownMessage
                    id='admin.billing.subscription.planDetails.userCountWithLimit'
                    defaultMessage='{userCount} / {userLimit} users'
                    values={{userCount, userLimit}}
                />
            </div>
        );
    } else {
        userCountDisplay = (
            <div className='PlanDetails__userCount'>
                <FormattedMarkdownMessage
                    id='admin.billing.subscription.planDetails.userCount'
                    defaultMessage='{userCount} users'
                    values={{userCount}}
                />
            </div>
        );
    }

    const featureList = features.map((feature, i) => (
        <div
            key={`PlanDetails__feature${i}`}
            className='PlanDetails__feature'
        >
            <i className='icon-check'/>
            <span>{feature}</span>
        </div>
    ));

    return (
        <div className='PlanDetails'>
            <div className='PlanDetails__top'>
                <div className='PlanDetails__productName'>
                    {'Mattermost Cloud'}
                </div>
                {userCountDisplay}
            </div>
            <div className='PlanDetails__plan'>
                <div className='PlanDetails__planName'>
                    {'Free'}
                </div>
                <div className='PlanDetails__planCaveat'>
                    {'up to 10 users'}
                </div>
            </div>
            <div className='PlanDetails__teamAndChannelCount'>
                {'Unlimited teams, channels, and search history'}
            </div>
            {featureList}
            <div className='PlanDetails__currentPlan'>
                <i className='icon-check-circle'/>
                <span>{'Current Plan'}</span>
            </div>
        </div>
    );
};

export default PlanDetails;
