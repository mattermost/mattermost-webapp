// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useEffect, useState, useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {selectChannel} from 'mattermost-redux/actions/channels';
import {CardSizes, InsightsWidgetTypes, TimeFrames} from '@mattermost/types/insights';

import {InsightsScopes} from 'utils/constants';
import {localizeMessage} from 'utils/utils';

import InsightsHeader from './insights_header/insights_header';
import TopChannels from './top_channels/top_channels';
import TopReactions from './top_reactions/top_reactions';
import TopThreads from './top_threads/top_threads';
import TopBoards from './top_boards/top_boards';

import './../activity_and_insights.scss';

const Insights = () => {
    const dispatch = useDispatch();
    const [filterType, setFilterType] = useState(InsightsScopes.MY);
    const [timeFrame, setTimeFrame] = useState({
        value: TimeFrames.INSIGHTS_7_DAYS,
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
                    timeFrame={timeFrame.value}
                    timeFrameLabel={timeFrame.label}
                />
                <TopThreads
                    size={CardSizes.small}
                    filterType={filterType}
                    widgetType={InsightsWidgetTypes.TOP_THREADS}
                    class={'top-threads-card'}
                    timeFrame={timeFrame.value}
                    timeFrameLabel={timeFrame.label}
                />
                <TopBoards
                    size={CardSizes.small}
                    filterType={filterType}
                    widgetType={InsightsWidgetTypes.TOP_BOARDS}
                    class={'top-boards-card'}
                    timeFrame={timeFrame.value}
                    timeFrameLabel={timeFrame.label}
                />
                <TopReactions
                    size={CardSizes.small}
                    filterType={filterType}
                    widgetType={InsightsWidgetTypes.TOP_REACTIONS}
                    class={'top-reactions-card'}
                    timeFrame={timeFrame.value}
                    timeFrameLabel={timeFrame.label}
                />
            </div>
        </>
    );
};

export default memo(Insights);
