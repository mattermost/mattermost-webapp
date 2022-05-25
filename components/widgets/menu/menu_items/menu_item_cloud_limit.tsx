// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';

import {isCloudLicense} from 'mattermost-redux/selectors/entities/general';
import {getCloudSubscription} from 'mattermost-redux/selectors/entities/cloud';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {isAdmin} from 'mattermost-redux/utils/user_utils';

import {limitThresholds} from 'utils/limits';

import useGetLimits from 'components/common/hooks/useGetLimits';
import useGetUsage from 'components/common/hooks/useGetUsage';
import useGetHighestThresholdCloudLimit from 'components/common/hooks/useGetHighestThresholdCloudLimit';

import UsagePercentBar from 'components/common/usage_percent_bar';

import useWords from './useWords';

import './menu_item.scss';

type Props = {
    id: string;
}

const MenuItemCloudLimit = ({id}: Props) => {
    const subscription = useSelector(getCloudSubscription);
    const isAdminUser = isAdmin(useSelector(getCurrentUser).roles);
    const isCloud = useSelector(isCloudLicense);
    const isFreeTrial = subscription?.is_free_trial === 'true';
    const [limits] = useGetLimits();
    const usage = useGetUsage();
    const highestLimit = useGetHighestThresholdCloudLimit(usage, limits);
    const words = useWords(highestLimit, isAdminUser);

    const show = isCloud && !isFreeTrial;
    if (!show || !words || !highestLimit) {
        return null;
    }

    let itemClass = 'MenuItemCloudLimit';
    if (((highestLimit.usage / highestLimit.limit) * 100) >= limitThresholds.danger) {
        itemClass += ' MenuItemCloudLimit--critical';
    }
    return (
        <li
            className={itemClass}
            role='menuitem'
            id={id}
        >
            <div className='MenuItemCloudLimit__title'>{words.title} <i className='icon icon-information-outline'/></div>
            <div className='MenuItemCloudLimit__description'>{words.description}</div>
            <div className='MenuItemCloudLimit__usage'>
                <UsagePercentBar
                    percent={Math.floor((highestLimit.usage / highestLimit.limit) * 100)}
                />
                <span className='MenuItemCloudLimit__usage-label'>{words.status}</span>
            </div>
        </li>
    );
};

export default MenuItemCloudLimit;
