// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useEffect, useState, useCallback, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {getMyTopDMs} from 'mattermost-redux/actions/insights';

import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import {TopDM} from '@mattermost/types/insights';

import {InsightsScopes} from 'utils/constants';

import TitleLoader from '../skeleton_loader/title_loader/title_loader';
import CircleLoader from '../skeleton_loader/circle_loader/circle_loader';
import widgetHoc, {WidgetHocProps} from '../widget_hoc/widget_hoc';
import WidgetEmptyState from '../widget_empty_state/widget_empty_state';

import TopDMsItem from './top_dms_item/top_dms_item';

import './../../activity_and_insights.scss';

const TopDMsAndNewMembers = (props: WidgetHocProps) => {
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);
    const [topDMs, setTopDMs] = useState([] as TopDM[]);
    const [newMembers] = useState([] as TopDM[]);

    const currentTeamId = useSelector(getCurrentTeamId);

    const getMyTopTeamDMs = useCallback(async () => {
        if (props.filterType === InsightsScopes.MY) {
            setLoading(true);
            const data: any = await dispatch(getMyTopDMs(currentTeamId, 0, 5, props.timeFrame));
            if (data.data?.items) {
                setTopDMs(data.data.items);
            }
            setLoading(false);
        }
    }, [props.timeFrame, props.filterType]);

    useEffect(() => {
        getMyTopTeamDMs();
    }, [getMyTopTeamDMs]);

    const skeletonLoader = useMemo(() => {
        const entries = [];
        for (let i = 0; i < 5; i++) {
            entries.push(
                <div
                    className='dms-loading-container'
                    key={i}
                >
                    <CircleLoader
                        size={72}
                    />
                    <div className='title-line'>
                        <TitleLoader/>
                    </div>
                    <div className='info-line'>
                        <TitleLoader/>
                        <TitleLoader/>
                    </div>
                </div>,
            );
        }
        return entries;
    }, []);

    return (
        <div className='top-dms-container'>
            {
                loading &&
                skeletonLoader
            }
            {
                (!loading && topDMs && props.filterType === InsightsScopes.MY) &&
                topDMs.map((topDM: TopDM, index: number) => {
                    const barSize = ((topDM.post_count / topDMs[0].post_count) * 0.6);
                    return (
                        <TopDMsItem
                            key={index}
                            dm={topDM}
                            barSize={barSize}
                        />
                    );
                })
            }
            {
                (((topDMs.length === 0 && props.filterType === InsightsScopes.MY) || (newMembers.length === 0 && props.filterType === InsightsScopes.TEAM)) && !loading) &&
                <WidgetEmptyState
                    icon={'account-multiple-outline'}
                />
            }
        </div>
    );
};

export default memo(widgetHoc(TopDMsAndNewMembers));
