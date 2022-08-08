// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useState, useCallback, useEffect, useMemo} from 'react';
import {useSelector} from 'react-redux';

import {Link} from 'react-router-dom';

import {trackEvent} from 'actions/telemetry_actions';

import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import {TopPlaybook} from '@mattermost/types/insights';

import {GlobalState} from 'types/store';

import TitleLoader from '../skeleton_loader/title_loader/title_loader';
import widgetHoc, {WidgetHocProps} from '../widget_hoc/widget_hoc';

import './../../activity_and_insights.scss';

const TopPlaybooks = (props: WidgetHocProps) => {
    const [loading, setLoading] = useState(false);
    const [topPlaybooks, setPlaybooks] = useState([] as TopPlaybook[]);

    const currentTeamId = useSelector(getCurrentTeamId);
    const playbooksHandler = useSelector((state: GlobalState) => state.plugins.insightsHandlers.playbooks);

    const getTopPlaybooks = useCallback(async () => {
        // setLoading(true);
        // const data: any = await boardsHandler(props.timeFrame, 0, 3, currentTeamId, props.filterType);
        // if (data.items) {
        //     setTopBoards(data.items);
        // }
        // setLoading(false);
    }, [props.timeFrame, currentTeamId, props.filterType]);

    useEffect(() => {
        getTopPlaybooks();
    }, [getTopPlaybooks]);

    const skeletonLoader = useMemo(() => {
        const entries = [];
        for (let i = 0; i < 3; i++) {
            entries.push(
                <div
                    className='top-playbooks-loading-container'
                    key={i}
                >
                    <TitleLoader/>
                    <TitleLoader/>
                </div>,
            );
        }
        return entries;
    }, []);

    const trackClickEvent = useCallback(() => {
        trackEvent('insights', 'open_playbook_from_top_playbooks_widget');
    }, []);

    return (
        <div className='top-playbooks-container'>
            {
                loading &&
                skeletonLoader
            }
            {
                (topPlaybooks && !loading) &&
                <div className='playbooks-list'>
                    <Link
                        className='playbook-item'
                        onClick={trackClickEvent}
                        to={'/boards/workspace/'}
                    >
                        <div className='display-info'>
                            <span className='display-name'>{'Support incidence'}</span>
                            <span className='last-run-time'>
                                {'Last run: 2d 5h 49m'}
                            </span>
                        </div>
                        <div className='display-info run-info'>
                            <span
                                className='horizontal-bar'
                                style={{
                                    width: '100%',
                                }}
                            />
                            <span className='last-run-time'>
                                {'32 runs'}
                            </span>
                        </div>
                    </Link>
                </div>
            }
            {/* {

                (topPlaybooks.length === 0 && !loading) &&
                <WidgetEmptyState
                    icon={'product-playbooks'}
                />
            } */}
        </div>
    );
};

export default memo(widgetHoc(TopPlaybooks));
