// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useState, useCallback, useEffect, useMemo} from 'react';
import {useSelector} from 'react-redux';

import {FormattedMessage} from 'react-intl';

import {Link} from 'react-router-dom';

import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import {TopBoard} from '@mattermost/types/insights';

import {GlobalState} from 'types/store';

import Avatars from 'components/widgets/users/avatars';

import TitleLoader from '../skeleton_loader/title_loader/title_loader';
import CircleLoader from '../skeleton_loader/circle_loader/circle_loader';
import widgetHoc, {WidgetHocProps} from '../widget_hoc/widget_hoc';
import WidgetEmptyState from '../widget_empty_state/widget_empty_state';

import './../../activity_and_insights.scss';

const TopBoards = (props: WidgetHocProps) => {
    const [loading, setLoading] = useState(true);
    const [topBoards, setTopBoards] = useState([] as TopBoard[]);

    const currentTeamId = useSelector(getCurrentTeamId);
    const boardsHandler = useSelector((state: GlobalState) => state.plugins.insightsHandlers.focalboard);

    const getTopBoards = useCallback(async () => {
        setLoading(true);
        const data: any = await boardsHandler(props.timeFrame, 0, 4, currentTeamId, props.filterType);
        if (data.items) {
            setTopBoards(data.items);
        }
        setLoading(false);
    }, [props.timeFrame, currentTeamId, props.filterType]);

    useEffect(() => {
        getTopBoards();
    }, [getTopBoards]);

    const skeletonLoader = useMemo(() => {
        const entries = [];
        for (let i = 0; i < 4; i++) {
            entries.push(
                <div
                    className='top-board-loading-container'
                    key={i}
                >
                    <CircleLoader
                        size={32}
                    />
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
        <div className='top-board-container'>
            {
                loading &&
                skeletonLoader
            }
            {
                (topBoards && !loading) &&
                <div className='board-list'>
                    {
                        topBoards.map((board, i) => {
                            return (
                                <Link
                                    className='board-item'
                                    key={i}
                                    to={`/boards/workspace/${board.workspaceID}/${board.boardID}`}
                                >
                                    <span className='board-icon'>{board.icon}</span>
                                    <div className='display-info'>
                                        <span className='display-name'>{board.title}</span>
                                        <span className='update-counts'>
                                            <FormattedMessage
                                                id='insights.topBoards.updates'
                                                defaultMessage='{updateCount} updates'
                                                values={{
                                                    updateCount: board.activityCount,
                                                }}
                                            />
                                        </span>
                                    </div>
                                    <Avatars
                                        userIds={board.activeUsers.split(',')}
                                        size='xs'
                                        disableProfileOverlay={true}
                                    />
                                </Link>
                            );
                        })
                    }
                </div>
            }
            {

                (topBoards.length === 0 && !loading) &&
                <WidgetEmptyState
                    icon={'product-boards'}
                />
            }
        </div>
    );
};

export default memo(widgetHoc(TopBoards));
