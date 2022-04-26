// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useEffect, useState, useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {selectChannel} from 'mattermost-redux/actions/channels';

import {InsightsTimeFrames, InsightsScopes} from 'utils/constants';
import {localizeMessage} from 'utils/utils';

import InsightsHeader from './insights_header/insights_header';
import TopChannels from './top_channels/top_channels';
import TopReactions from './top_reactions/top_reactions';

import './../activity_and_insights.scss';

export enum InsightsWidgetTypes {
    TOP_CHANNELS = 'TOP_CHANNELS',
    TOP_REACTIONS = 'TOP_REACTIONS',
}

export enum CardSizes {
    large = 'lg',
    medium = 'md',
    small = 'sm',
}
export type CardSize = CardSizes;

const Insights = () => {
    const dispatch = useDispatch();
    const [filterType, setFilterType] = useState(InsightsScopes.MY);
    const [timeFrame, setTimeFrame] = useState({
        value: InsightsTimeFrames.INSIGHTS_7_DAYS,
        label: localizeMessage('insights.timeFrame.mediumRange', 'Last 7 days'),
    });

    const setFilterTypeTeam = useCallback(() => {
        setFilterType(InsightsScopes.TEAM);
    }, []);

    const setFilterTypeMy = useCallback(() => {
        setFilterType(InsightsScopes.MY);
    }, []);

    const setTimeFrameValue = useCallback((value) => {
        setTimeFrame(value);
    }, []);

    useEffect(() => {
        dispatch(selectChannel(''));
    }, []);

    return (
        <>
            <InsightsHeader
                filterType={filterType}
                setFilterTypeTeam={setFilterTypeTeam}
                setFilterTypeMy={setFilterTypeMy}
                timeFrame={timeFrame}
                setTimeFrame={setTimeFrameValue}
            />
            <div className='insights-body'>
                <TopChannels
                    size={CardSizes.large}
                    filterType={filterType}
                    widgetType={InsightsWidgetTypes.TOP_CHANNELS}
                    class={'top-channels-card'}
                />
                <TopReactions
                    size={CardSizes.small}
                    filterType={filterType}
                    widgetType={InsightsWidgetTypes.TOP_REACTIONS}
                    class={'top-reactions-card'}
                />
            </div>
        </>
    );
};

export default memo(Insights);
