// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useState, useMemo, useEffect, useCallback} from 'react';
import {useSelector} from 'react-redux';
import {FormattedMessage} from 'react-intl';

import classNames from 'classnames';

import {trackEvent} from 'actions/telemetry_actions';

import {GlobalState} from 'types/store';

import {TimeFrame, TopBoard} from '@mattermost/types/insights';

import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import DataGrid, {Row, Column} from 'components/admin_console/data_grid/data_grid';
import Avatars from 'components/widgets/users/avatars';

import './../../../activity_and_insights.scss';

type Props = {
    filterType: string;
    timeFrame: TimeFrame;
}

const TopBoardsTable = (props: Props) => {
    const [loading, setLoading] = useState(true);
    const [topBoards, setTopBoards] = useState([] as TopBoard[]);

    const currentTeamId = useSelector(getCurrentTeamId);
    const boardsHandler = useSelector((state: GlobalState) => state.plugins.insightsHandlers.focalboard);

    const getTopBoards = useCallback(async () => {
        setLoading(true);
        const data: any = await boardsHandler(props.timeFrame, 0, 10, currentTeamId, props.filterType);
        if (data.items) {
            setTopBoards(data.items);
        }
        setLoading(false);
    }, [props.timeFrame, currentTeamId, props.filterType]);

    useEffect(() => {
        getTopBoards();
    }, [getTopBoards]);

    const trackClickEvent = useCallback(() => {
        trackEvent('insights', 'open_board_from_top_boards_modal');
    }, []);

    const getColumns = useMemo((): Column[] => {
        const columns: Column[] = [
            {
                name: (
                    <FormattedMessage
                        id='insights.topReactions.rank'
                        defaultMessage='Rank'
                    />
                ),
                field: 'rank',
                className: 'rankCell',
                width: 0.07,
            },
            {
                name: (
                    <FormattedMessage
                        id='insights..topBoards.board'
                        defaultMessage='Board'
                    />
                ),
                field: 'board',
                width: 0.7,
            },
            {
                name: (
                    <FormattedMessage
                        id='insights.topBoards.updates'
                        defaultMessage='Updates'
                    />
                ),
                field: 'updates',
                width: 0.08,
            },
            {
                name: (
                    <FormattedMessage
                        id='insights..topBoards.participants'
                        defaultMessage='Participants'
                    />
                ),
                field: 'participants',
                width: 0.15,
            },
        ];
        return columns;
    }, []);

    const getRows = useMemo((): Row[] => {
        return topBoards.map((board, i) => {
            return (
                {
                    cells: {
                        rank: (
                            <span className='cell-text'>
                                {i + 1}
                            </span>
                        ),
                        board: (
                            <div className='board-item'>
                                <span className='board-icon'>{board.icon}</span>
                                <span className='board-title'>{board.title}</span>
                            </div>
                        ),
                        updates: (
                            <span className='board-updates'>{board.activityCount}</span>
                        ),
                        participants: (
                            <Avatars
                                userIds={board.activeUsers.split(',')}
                                size='xs'
                                disableProfileOverlay={true}
                            />
                        ),
                    },
                    onClick: trackClickEvent,
                }
            );
        });
    }, [topBoards]);

    return (
        <DataGrid
            columns={getColumns}
            rows={getRows}
            loading={loading}
            page={0}
            nextPage={() => {}}
            previousPage={() => {}}
            startCount={1}
            endCount={10}
            total={0}
            className={classNames('InsightsTable', 'TopBoardsTable')}
        />
    );
};

export default memo(TopBoardsTable);
