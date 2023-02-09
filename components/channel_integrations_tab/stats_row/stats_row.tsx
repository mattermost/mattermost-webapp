// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';

import {CardSizes, ItemProp} from '@mattermost/types/channel_integrations_tab';

import StatsRowItem from './stats_row_item/stats_row_item';
import StatsCard from './../card/card';

export type Props = {
    items: ItemProp[];
}

const StatsRow = ({items}: Props) => {
    return (
        <div className='top-dms-container'>
            {
                items.map((item: ItemProp, index: number) => {
                    return (
                        <StatsCard
                            key={index}
                            size={CardSizes.large}
                            class={'top-dms-card'}
                            title={`Plugin ${index + 1}`}
                        >
                            <StatsRowItem
                                total={item.total}
                                label={item.label}
                            />
                        </StatsCard>
                    );
                })
            }
        </div>
    );
};

export default memo(StatsRow);
