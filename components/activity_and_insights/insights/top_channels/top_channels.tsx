// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo} from 'react';

import {useIntl} from 'react-intl';

import InsightsCard from '../card/card';
import {CardSize} from '../insights';

import './../../activity_and_insights.scss';

type Props = {
    size: CardSize;
};

const TopChannels = (props: Props) => {
    const {formatMessage} = useIntl();

    return (
        <InsightsCard
            class={'top-channels-card'}
            title={formatMessage({
                id: 'insights.topChannels.title',
                defaultMessage: 'Top Channels',
            })}
            subTitle={formatMessage({
                id: 'insights.topChannels.subTitle',
                defaultMessage: 'Most active channels for the team',
            })}
            size={props.size}
        >
            <></>
        </InsightsCard>
    );
};

export default memo(TopChannels);
