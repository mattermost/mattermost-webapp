// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useCallback, useEffect, useState} from 'react';
import {useDispatch, useSelector, shallowEqual} from 'react-redux';

import {InsightsScopes} from 'utils/constants';

import CircleLoader from '../skeleton_loader/circle_loader/circle_loader';
import TitleLoader from '../skeleton_loader/title_loader/title_loader';
import LineChartLoader from '../skeleton_loader/line_chart_loader/line_chart_loader';
import widgetHoc, {WidgetHocProps} from '../widget_hoc/widget_hoc';

import './../../activity_and_insights.scss';
import { getCurrentTeamId } from 'mattermost-redux/selectors/entities/teams';
import {GlobalState} from 'mattermost-redux/types/store';
import { getMyTopChannels, getTopChannelsForTeam } from 'mattermost-redux/actions/insights';
import { getMyTopChannelsForCurrentTeam, getTopChannelsForCurrentTeam } from 'mattermost-redux/selectors/entities/insights';

// eslint-disable-next-line no-empty-pattern
const TopChannels = (props: WidgetHocProps) => {
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(true);

    const teamTopChannels = useSelector((state: GlobalState) => getTopChannelsForCurrentTeam(state, props.timeFrame, 5), shallowEqual);
    const myTopChannels = useSelector((state: GlobalState) => getMyTopChannelsForCurrentTeam(state, props.timeFrame, 5), shallowEqual);

    const currentTeamId = useSelector(getCurrentTeamId);

    const getTopTeamChannels = useCallback(async () => {
        if (props.filterType === InsightsScopes.TEAM) {
            setLoading(true);
            await dispatch(getTopChannelsForTeam(currentTeamId, 0, 10, props.timeFrame));
            setLoading(false);
        }
    }, [props.timeFrame, currentTeamId, props.filterType]);

    useEffect(() => {
        getTopTeamChannels();
    }, [getTopTeamChannels]);

    const getMyTeamChannels = useCallback(async () => {
        if (props.filterType === InsightsScopes.MY) {
            setLoading(true);
            await dispatch(getMyTopChannels(currentTeamId, 0, 10, props.timeFrame));
            setLoading(false);
        }
    }, [props.timeFrame, props.filterType]);

    useEffect(() => {
        getMyTeamChannels();
    }, [getMyTeamChannels]);

    const skeletonTitle = useCallback(() => {
        const titles = [];
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
                </div>,
            );
        }
        return titles;
    }, []);

    return (
        <div className='top-channel-container'>
            <div className='top-channel-line-chart'>
                {
                    loading &&
                    <LineChartLoader/>
                }
            </div>
            <div className='top-channel-list'>
                {
                    loading &&
                    skeletonTitle()
                }
            </div>
        </div>
    );
};

export default memo(widgetHoc(TopChannels));
