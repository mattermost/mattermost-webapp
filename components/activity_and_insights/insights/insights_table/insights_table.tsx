// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo} from 'react';

import {FormattedMessage} from 'react-intl';

import DataGrid, {Row, Column} from 'components/admin_console/data_grid/data_grid';
import RenderEmoji from 'components/emoji/render_emoji';

import './../../activity_and_insights.scss';
import './insights_table.scss';

type Props = {
    widgetType: 'TOP_CHANNELS' | 'TOP_REACTIONS';
}

const InsightsTable = (props: Props) => {

    const getColumns = (): Column[] => {
        const columns: Column[] = [
            {
                name: (
                    <FormattedMessage
                        id='insights.topRections.rank'
                        defaultMessage='Rank'
                    />
                ),
                field: 'rank',
                className: 'rankCell',
                width: .2,
            },
            {
                name: (
                    <FormattedMessage
                        id='insights.topRections.reaction'
                        defaultMessage='Reaction'
                    />
                ),
                field: 'reaction',
            },
            {
                name: (
                    <FormattedMessage
                        id='insights.topRections.timesUsed'
                        defaultMessage='Times used'
                    />
                ),
                field: 'times_used',
            },
        ];
        return columns;
    }

    const getRows = (): Row[] => {
        return [
            {
                cells: {
                    rank: (
                        <span className='cell-text'>
                            {'1'}
                        </span>
                    ),
                    reaction: (
                        <>
                            <RenderEmoji
                                emojiName={'grinning'}
                                size={24}
                            />
                            <span className='cell-text'>
                                {'grinning'}
                            </span>
                        </>
                    ),
                    times_used: (
                        <span className='cell-text'>
                            {'45'}
                        </span>
                    ),
                }
            },
            {
                cells: {
                    rank: (
                        <span className='cell-text'>
                            {'2'}
                        </span>
                    ),
                    reaction: (
                        <>
                            <RenderEmoji
                                emojiName={'tada'}
                                size={24}
                            />
                            <span className='cell-text'>
                                {'tada'}
                            </span>
                        </>
                    ),
                    times_used: (
                        <span className='cell-text'>
                            {'45'}
                        </span>
                    ),
                }
            },
            {
                cells: {
                    rank: (
                        <span className='cell-text'>
                            {'40'}
                        </span>
                    ),
                    reaction: (
                        <>
                            <RenderEmoji
                                emojiName={'rocket'}
                                size={24}
                            />
                            <span className='cell-text'>
                                {'rocket'}
                            </span>
                        </>
                    ),
                    times_used: (
                        <span className='cell-text'>
                            {'36'}
                        </span>
                    ),
                }
            },
        ];
    }

    return (
        <DataGrid
            columns={getColumns()}
            rows={getRows()}
            loading={false}
            page={0}
            nextPage={() => {}}
            previousPage={() => {}}
            startCount={1}
            endCount={4}
            total={0}
            className={'insightsTable'}
        />
    );
};

export default memo(InsightsTable);
