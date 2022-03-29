// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useEffect, useState, useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {selectChannel} from 'mattermost-redux/actions/channels';

import {localizeMessage} from 'utils/utils';

import InsightsHeader from './insights_header/insights_header';

import './../activity_and_insights.scss';

const Insights = () => {
    const dispatch = useDispatch();
    const [filterType, setFilterType] = useState('my');
    const [timeFrame, setTimeFrame] = useState({
        value: '1_day',
        label: localizeMessage('insights.timeFrame.today', 'Today'),
    });

    const setFilterTypeTeam = useCallback(() => {
        setFilterType('team');
    }, []);

    const setFilterTypeMy = useCallback(() => {
        setFilterType('my');
    }, []);

    const setTimeFrameValue = useCallback((value) => {
        setTimeFrame(value);

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
