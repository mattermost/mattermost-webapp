// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useCallback, useEffect, useState} from 'react';

import {FormattedMessage} from 'react-intl';

import {useDispatch, useSelector} from 'react-redux';

import {TimeFrame} from '@mattermost/types/insights';

import DataGrid, {Row, Column} from 'components/admin_console/data_grid/data_grid';
import RenderEmoji from 'components/emoji/render_emoji';

import {InsightsScopes} from 'utils/constants';
import {GlobalState} from '@mattermost/types/store';
import {getCurrentTeamId, getTopReactionsForCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getMyTopReactionsByTime} from 'mattermost-redux/selectors/entities/users';
import {getTopReactionsForTeam} from 'mattermost-redux/actions/teams';
import {getMyTopReactions} from 'mattermost-redux/actions/users';

import './../../../activity_and_insights.scss';
import {TopReaction} from '@mattermost/types/reactions';

type Props = {
    filterType: string;
    timeFrame: TimeFrame;
}

const TopReactionsTable = (props: Props) => {
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(true);
    const [topReactions, setTopReactions] = useState([] as TopReaction[]);

    const teamTopReactions = useSelector((state: GlobalState) => getTopReactionsForCurrentTeam(state, props.timeFrame, 10));
    const myTopReactions = useSelector((state: GlobalState) => getMyTopReactionsByTime(state, props.timeFrame, 10));

    useEffect(() => {
        if (props.filterType === InsightsScopes.TEAM) {
            setTopReactions(teamTopReactions);
        } else {
            setTopReactions(myTopReactions);
        }
    }, [props.filterType, props.timeFrame]);

    const currentTeamId = useSelector(getCurrentTeamId);

    const getTopTeamReactions = useCallback(async () => {
        if (props.filterType === InsightsScopes.TEAM) {
            setLoading(true);
            await dispatch(getTopReactionsForTeam(currentTeamId, 0, 10, props.timeFrame));
            setLoading(false);
        }
    }, [props.timeFrame, currentTeamId, props.filterType]);

    useEffect(() => {
        getTopTeamReactions();
    }, [getTopTeamReactions]);

    const getMyTeamReactions = useCallback(async () => {
        if (props.filterType === InsightsScopes.MY) {
            setLoading(true);
            await dispatch(getMyTopReactions(0, 10, props.timeFrame));
            setLoading(false);
        }
    }, [props.timeFrame, props.filterType]);

    useEffect(() => {
        getMyTeamReactions();
    }, [getMyTeamReactions]);

    const getColumns = (): Column[] => {
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
                width: 0.2,
            },
            {
                name: (
                    <FormattedMessage
                        id='insights.topReactions.reaction'
                        defaultMessage='Reaction'
                    />
                ),
                field: 'reaction',
            },
            {
                name: (
                    <FormattedMessage
                        id='insights.topReactions.timesUsed'
                        defaultMessage='Times used'
                    />
                ),
                field: 'times_used',
            },
        ];
        return columns;
    };

    const getRows = (): Row[] => {
        return topReactions.map((reaction, i) => {
            return (
                {
                    cells: {
                        rank: (
                            <span className='cell-text'>
                                {i + 1}
                            </span>
                        ),
                        reaction: (
                            <>
                                <RenderEmoji
                                    emojiName={reaction.emoji_name}
                                    size={24}
                                />
                                <span className='cell-text'>
                                    {reaction.emoji_name}
                                </span>
                            </>
                        ),
                        times_used: (
                            <span className='cell-text'>
                                {reaction.count}
                            </span>
                        ),
                    },
                }
            );
        });

        // return [
        //     {
        //         cells: {
        //             rank: (
        //                 <span className='cell-text'>
        //                     {'1'}
        //                 </span>
        //             ),
        //             reaction: (
        //                 <>
        //                     <RenderEmoji
        //                         emojiName={'grinning'}
        //                         size={24}
        //                     />
        //                     <span className='cell-text'>
        //                         {'grinning'}
        //                     </span>
        //                 </>
        //             ),
        //             times_used: (
        //                 <span className='cell-text'>
        //                     {'45'}
        //                 </span>
        //             ),
        //         },
        //     },
        //     {
        //         cells: {
        //             rank: (
        //                 <span className='cell-text'>
        //                     {'2'}
        //                 </span>
        //             ),
        //             reaction: (
        //                 <>
        //                     <RenderEmoji
        //                         emojiName={'tada'}
        //                         size={24}
        //                     />
        //                     <span className='cell-text'>
        //                         {'tada'}
        //                     </span>
        //                 </>
        //             ),
        //             times_used: (
        //                 <span className='cell-text'>
        //                     {'45'}
        //                 </span>
        //             ),
        //         },
        //     },
        //     {
        //         cells: {
        //             rank: (
        //                 <span className='cell-text'>
        //                     {'3'}
        //                 </span>
        //             ),
        //             reaction: (
        //                 <>
        //                     <RenderEmoji
        //                         emojiName={'rocket'}
        //                         size={24}
        //                     />
        //                     <span className='cell-text'>
        //                         {'rocket'}
        //                     </span>
        //                 </>
        //             ),
        //             times_used: (
        //                 <span className='cell-text'>
        //                     {'36'}
        //                 </span>
        //             ),
        //         },
        //     },
        // ];
    };

    return (
        <>
            {
                loading &&
                <></>
            }
            {
                !loading &&
                <DataGrid
                    columns={getColumns()}
                    rows={getRows()}
                    loading={false}
                    page={0}
                    nextPage={() => {}}
                    previousPage={() => {}}
                    startCount={1}
                    endCount={10}
                    total={0}
                    className={'InsightsTable'}
                />
            }
        </>
    );
};

export default memo(TopReactionsTable);
