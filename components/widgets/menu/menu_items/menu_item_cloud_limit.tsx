// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import UpgradeLink from 'components/widgets/links/upgrade_link';
import {CloudUsage, Limits} from '@mattermost/types/cloud';

import {GlobalState} from 'mattermost-redux/types/store';
import {isCloudLicense} from 'mattermost-redux/selectors/entities/general';

import {getRemainingDaysFromFutureTimestamp} from 'utils/utils';
import {TrialPeriodDays} from 'utils/constants';

import './menu_item.scss';

type Props = {
    id: string;
}

function getWords(usage: CloudUsage, limits: Limits): string | false {
    if (Object.keys(limits).length === 0) {
        return false
    }
    const maybeMessageHistoryLimit = limits.messages?.history;
    const messageHistoryUsage = usage.messages.history;

    const maybeBoardsCardsLimit = limits.boards?.cards;
    const messageHistoryUsage = usage.messages.history;
    // no words
    return false;
}

const MenuCloudTrial: React.FC<Props> = ({id}: Props) => {
    const subscription = useSelector((state: GlobalState) => state.entities.cloud.subscription);
    const isCloud = useSelector(isCloudLicense);
    const isFreeTrial = subscription?.is_free_trial === 'true';

    let daysLeftOnTrial = getRemainingDaysFromFutureTimestamp(subscription?.trial_end_at);
    if (daysLeftOnTrial > TrialPeriodDays.TRIAL_MAX_DAYS) {
        daysLeftOnTrial = TrialPeriodDays.TRIAL_MAX_DAYS;
    }

    const show = isCloud && isFreeTrial;
    if (!show) {
        return null;
    }

    return (
        <li
            className={'MenuCloudTrial'}
            role='menuitem'
            id={id}
        >
            <FormattedMessage
                id='admin.billing.subscription.cloudTrial.menuCloudTrial'
                defaultMessage='There are {daysLeftOnTrial} days left on your Cloud trial.'
                values={{daysLeftOnTrial}}
            />
            <UpgradeLink
                buttonText='Subscribe Now'
                styleLink={true}
            />
        </li>
    );
};
export default MenuCloudTrial;

