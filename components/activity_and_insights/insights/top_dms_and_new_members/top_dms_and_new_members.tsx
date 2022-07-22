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

import './../../activity_and_insights.scss';

const TopDMsAndNewMembers = (props: WidgetHocProps) => {
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(true);
    const [topThreads, setTopThreads] = useState([] as TopThread[]);

    const currentTeamId = useSelector(getCurrentTeamId);

    

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
            
        </div>
    );
};

export default memo(widgetHoc(TopDMsAndNewMembers));
