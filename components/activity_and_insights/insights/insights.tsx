// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useState, useCallback, useEffect} from 'react';
import {useDispatch} from 'react-redux';

import {selectChannel} from 'mattermost-redux/actions/channels';

import {InsightsTimeFrames} from 'utils/constants';
import {localizeMessage} from 'utils/utils';

import InsightsHeader from './insights_header/insights_header';

import './../activity_and_insights.scss';

const Insights = () => {
    const dispatch = useDispatch();

    const [filterType, setFilterType] = useState('my');
    const [timeFrame, setTimeFrame] = useState({
        value: InsightsTimeFrames.INSIGHTS_7_DAYS,
        label: localizeMessage('insights.timeFrame.mediumRange', 'Last 7 days'),
    });

    const setFilterTypeTeam = useCallback(() => {
        setFilterType('team');
    }, []);

    const setFilterTypeMy = useCallback(() => {
        setFilterType('my');
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
        </>
    );
};

export default memo(Insights);
