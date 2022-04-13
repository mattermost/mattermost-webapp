// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {getTopReactionsForTeam} from 'mattermost-redux/actions/teams';
import {getCurrentTeamId, getTopReactionsForCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {GlobalState} from 'mattermost-redux/types/store';

import BarChartLoader from '../skeleton_loader/bar_chart_loader/bar_chart_loader';
import CircleLoader from '../skeleton_loader/circle_loader/circle_loader';
import widgetHoc, { WidgetHocProps } from '../widget_hoc/widget_hoc';

import './../../activity_and_insights.scss';
import {TimeFrames} from 'mattermost-redux/types/insights';

const TopReactions = (props: WidgetHocProps) => {
    const dispatch = useDispatch();
    const topTeamReactions = useSelector((state: GlobalState) => getTopReactionsForCurrentTeam(state, props.timeFrame));
    const currentTeamId = useSelector(getCurrentTeamId);

    console.log(topTeamReactions);

    useEffect(() => {
        dispatch(getTopReactionsForTeam(currentTeamId, 0, 10, props.timeFrame));
    }, [props.timeFrame, currentTeamId]);

    return (
        <div className='top-reaction-container'>
            <div className='bar-chart-entry'>
                <BarChartLoader/>
                <CircleLoader
                    size={20}
                />
            </div>
            <div className='bar-chart-entry'>
                <BarChartLoader/>
                <CircleLoader
                    size={20}
                />
            </div>
            <div className='bar-chart-entry'>
                <BarChartLoader/>
                <CircleLoader
                    size={20}
                />
            </div>
            <div className='bar-chart-entry'>
                <BarChartLoader/>
                <CircleLoader
                    size={20}
                />
            </div>
            <div className='bar-chart-entry'>
                <BarChartLoader/>
                <CircleLoader
                    size={20}
                />
            </div>
        </div>
    );
};

export default memo(widgetHoc(TopReactions));
