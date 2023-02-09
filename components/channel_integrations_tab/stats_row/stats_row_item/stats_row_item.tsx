// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';

import {ItemProp} from '@mattermost/types/channel_integrations_tab';

const StatsRowItem = ({total, label}: ItemProp) => {
    return (
        <div className='new-members-item new-members-info'>
            <span className='total-count'>{total}</span>
            <div className='members-info'>
                {label}
            </div>
        </div>
    );
};

export default memo(StatsRowItem);
