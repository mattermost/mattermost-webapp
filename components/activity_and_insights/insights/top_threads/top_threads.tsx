// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useEffect, useState, useCallback, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {getMyTopThreads, getTopThreadsForTeam} from 'mattermost-redux/actions/insights';

import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import {TopThread} from '@mattermost/types/insights';
import {GlobalState} from '@mattermost/types/store';

import {InsightsScopes} from 'utils/constants';

import TitleLoader from '../skeleton_loader/title_loader/title_loader';
import CircleLoader from '../skeleton_loader/circle_loader/circle_loader';
import widgetHoc, {WidgetHocProps} from '../widget_hoc/widget_hoc';
import WidgetEmptyState from '../widget_empty_state/widget_empty_state';

import TopThreadsItem from './top_threads_item/top_threads_item';

import './../../activity_and_insights.scss';
import './top_threads.scss';

const TopThreads = (props: WidgetHocProps) => {
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(true);
    const [topThreads, setTopThreads] = useState([] as TopThread[]);

    const currentTeamId = useSelector(getCurrentTeamId);
    const complianceExportEnabled = useSelector((state: GlobalState) => state.entities.general.config.EnableComplianceExport);

    const getTopTeamThreads = useCallback(async () => {
        if (props.filterType === InsightsScopes.TEAM) {
            setLoading(true);
            const data: any = await dispatch(getTopThreadsForTeam(currentTeamId, 0, 3, props.timeFrame));
            if (data.data?.items) {
                setTopThreads(data.data.items);
            }
            setLoading(false);
        }
    }, [props.timeFrame, currentTeamId, props.filterType]);

    useEffect(() => {
        getTopTeamThreads();
    }, [getTopTeamThreads]);

    const getMyTeamThreads = useCallback(async () => {
        if (props.filterType === InsightsScopes.MY) {
            setLoading(true);
            const data: any = await dispatch(getMyTopThreads(currentTeamId, 0, 3, props.timeFrame));
            if (data.data?.items) {
                setTopThreads(data.data.items);
            }
            setLoading(false);
        }
    }, [props.timeFrame, props.filterType]);

    useEffect(() => {
        getMyTeamThreads();
    }, [getMyTeamThreads]);

    const skeletonLoader = useMemo(() => {
        const entries = [];
        for (let i = 0; i < 3; i++) {
            entries.push(
                <div
                    className='top-thread-loading-container'
                    key={i}
                >
                    <div className='top-thread-loading-row'>
                        <CircleLoader
                            size={20}
                        />
                        <TitleLoader/>
                    </div>
                    <div className='loading-lines'>
                        <TitleLoader/>
                        <TitleLoader/>
                    </div>
                </div>,
            );
        }
        return entries;
    }, []);

    return (
        <div className='top-thread-container'>
            {
                loading &&
                skeletonLoader
            }
            {
                (topThreads && !loading) &&
                <div className='thread-list'>
                    {
                        topThreads.map((thread, key) => {
                            return (
                                <TopThreadsItem
                                    thread={thread}
                                    key={key}
                                    complianceExportEnabled={complianceExportEnabled}
                                />
                            );
                        })
                    }
                </div>

            }
            {
                (topThreads.length === 0 && !loading) &&
                <WidgetEmptyState
                    icon={'message-text-outline'}
                />
            }
        </div>
    );
};

export default memo(widgetHoc(TopThreads));
