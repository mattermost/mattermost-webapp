// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import classNames from 'classnames';

import {selectPost} from 'actions/views/rhs';

import {TimeFrame, TopThread} from '@mattermost/types/insights';
import {Post} from '@mattermost/types/posts';

import DataGrid, {Row, Column} from 'components/admin_console/data_grid/data_grid';

import {InsightsScopes} from 'utils/constants';
import {imageURLForUser} from 'utils/utils';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getMyTopThreads as fetchMyTopThreads, getTopThreadsForTeam} from 'mattermost-redux/actions/insights';

import Badge from 'components/widgets/badges/badge';
import Avatar from 'components/widgets/users/avatar';
import Avatars from 'components/widgets/users/avatars';
import Markdown from 'components/markdown';
import Attachment from 'components/threading/global_threads/thread_item/attachments';

import './../../../activity_and_insights.scss';
import '../top_threads.scss';

type Props = {
    filterType: string;
    timeFrame: TimeFrame;
    closeModal: () => void;
}

const TopThreadsTable = (props: Props) => {
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(true);
    const [topThreads, setTopThreads] = useState([] as TopThread[]);

    const currentTeamId = useSelector(getCurrentTeamId);

    const getTopTeamThreads = useCallback(async () => {
        if (props.filterType === InsightsScopes.TEAM) {
            setLoading(true);
            const data: any = await dispatch(getTopThreadsForTeam(currentTeamId, 0, 5, props.timeFrame));
            if (data.data && data.data.items) {
                setTopThreads(data.data.items);
            }
            setLoading(false);
        }
    }, [props.timeFrame, currentTeamId, props.filterType]);

    useEffect(() => {
        getTopTeamThreads();
    }, [getTopTeamThreads]);

    const getMyTopThreads = useCallback(async () => {
        if (props.filterType === InsightsScopes.MY) {
            setLoading(true);
            const data: any = await dispatch(fetchMyTopThreads(currentTeamId, 0, 5, props.timeFrame));
            if (data.data && data.data.items) {
                setTopThreads(data.data.items);
            }
            setLoading(false);
        }
    }, [props.timeFrame, props.filterType]);

    useEffect(() => {
        getMyTopThreads();
    }, [getMyTopThreads]);

    const imageProps = useMemo(() => ({
        onImageHeightChanged: () => {},
        onImageLoaded: () => {},
    }), []);

    const closeModal = useCallback(() => {
        props.closeModal();
    }, [props.closeModal]);

    const openThread = (post: Post) => {
        dispatch(selectPost(post));
        closeModal();
    };

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
                        id='insights.topThreads.thread'
                        defaultMessage='Thread'
                    />
                ),
                field: 'thread',
                width: 0.7,
            },
            {
                name: (
                    <FormattedMessage
                        id='insights.topThreads.totalMessages'
                        defaultMessage='Participants'
                    />
                ),
                field: 'participants',
                width: 0.15,
            },
            {
                name: (
                    <FormattedMessage
                        id='insights.topThreads.replies'
                        defaultMessage='Replies'
                    />
                ),
                field: 'replies',
                width: 0.08,
            },
        ];
        return columns;
    }, []);

    const getRows = useMemo((): Row[] => {
        return topThreads.map((thread, i) => {
            return (
                {
                    cells: {
                        rank: (
                            <span className='cell-text'>
                                {i + 1}
                            </span>
                        ),
                        thread: (
                            <div className='thread-item'>
                                <div className='thread-details'>
                                    <Avatar
                                        url={imageURLForUser(thread.user_id)}
                                        size={'xs'}
                                    />
                                    <span className='display-name'>{`${thread.user_information.first_name} ${thread.user_information.last_name}`}</span>
                                    <Badge>
                                        {thread.channel_display_name}
                                    </Badge>
                                </div>
                                <div
                                    aria-readonly='true'
                                    className='preview'
                                >
                                    {thread.post.message ? (
                                        <Markdown
                                            message={thread.post.message}
                                            options={{
                                                singleline: true,
                                                mentionHighlight: false,
                                                atMentions: false,
                                            }}
                                            imagesMetadata={thread.post?.metadata && thread.post?.metadata?.images}
                                            imageProps={imageProps}
                                        />
                                    ) : (
                                        <Attachment post={thread.post}/>
                                    )}
                                </div>
                            </div>
                        ),
                        participants: (
                            <>
                                {thread.participants && thread.participants.length > 0 ? (
                                    <Avatars
                                        userIds={thread.participants}
                                        size='xs'
                                        disableProfileOverlay={true}
                                    />
                                ) : null}
                            </>

                        ),
                        replies: (
                            <span className='replies'>{thread.reply_count}</span>
                        ),
                    },
                    onClick: () => {
                        openThread(thread.post);
                    },
                }
            );
        });
    }, [topThreads]);

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
            className={classNames('InsightsTable', 'TopThreadsTable')}
        />
    );
};

export default memo(TopThreadsTable);
