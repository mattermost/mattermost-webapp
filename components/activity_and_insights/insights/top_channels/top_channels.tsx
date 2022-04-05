// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useState} from 'react';

import {useIntl} from 'react-intl';

import InsightsCard from '../card/card';
import {CardSize} from '../insights';
import CircleLoader from '../skeleton_loader/circle_loader/circle_loader';
import TitleLoader from '../skeleton_loader/title_loader/title_loader';
import LineChartLoader from '../skeleton_loader/line_chart_loader/line_chart_loader';

import './../../activity_and_insights.scss';

type Props = {
    size: CardSize;
};

const TopChannels = (props: Props) => {
    const {formatMessage} = useIntl();
    const [loading, setLoading] = useState(true);

    const skeletonTitle = () => {
        let titles = [];
        for (let i = 0; i < 5; i++) {
            titles.push(
                <div 
                    className='top-channel-row'
                    key={i}
                >
                    <CircleLoader
                        size={16}
                    />
                    <TitleLoader/>
                </div>
            );
        }
        return titles;
    }

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
            <div className='top-channel-container'>
                <div className='top-channel-line-chart'>
                    {
                        loading &&
                        <LineChartLoader />
                    }
                </div>
                <div className='top-channel-list'>
                    {
                        loading &&
                        skeletonTitle()
                    }
                </div>
            </div>
        </InsightsCard>
    );
};

export default memo(TopChannels);
