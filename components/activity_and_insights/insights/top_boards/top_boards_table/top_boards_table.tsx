// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useState, useMemo} from 'react';
import {useDispatch} from 'react-redux';
import {FormattedMessage} from 'react-intl';

import classNames from 'classnames';

import {TimeFrame} from '@mattermost/types/insights';

import DataGrid, {Row, Column} from 'components/admin_console/data_grid/data_grid';
import Avatars from 'components/widgets/users/avatars';

import './../../../activity_and_insights.scss';

type Props = {
    filterType: string;
    timeFrame: TimeFrame;
}

const TopBoardsTable = (props: Props) => {
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);
    const [topBoards, setTopBoards] = useState([
        {
            boardID: 'bywgrht51s3y4unm6478becycxa',
            icon: '⛄',
            title: 'Project Tasks',
            activityCount: 51,
            activeUsers: 'jddqfjxezifxbnwdw75xsdsqcy',
            createdBy: 'excsimz1j387ibfz7bofc4zaie',
        },
        {
            boardID: 'biiow3dns57dr5k5qmse58b3j1r',
            icon: '📅',
            title: 'Content Calendar',
            activityCount: 21,
            activeUsers: 'jddqfjxezifxbnwdw75xsdsqcy',
            createdBy: 'excsimz1j387ibfz7bofc4zaie',
        },
    ]);

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

                    // onClick: () => {
                    //     openThread(thread.post);
                    // },
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
