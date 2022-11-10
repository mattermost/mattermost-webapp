// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useEffect, useMemo, useState} from 'react';
import {useIntl} from 'react-intl';
import classNames from 'classnames';
import {useDispatch, useSelector} from 'react-redux';

import {CloseIcon, MessageTextOutlineIcon} from '@mattermost/compass-icons/components';

import styled from 'styled-components';

import {getChannel as fetchChannel} from 'mattermost-redux/actions/channels';
import {getCurrentUserId, makeGetDisplayName} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'types/store';

import {getPost} from 'mattermost-redux/selectors/entities/posts';

import {getThread} from 'mattermost-redux/selectors/entities/threads';

import {useThreadRouting} from '../hooks';

import ThreadViewer from '../thread_viewer';

import {getChannel} from 'mattermost-redux/selectors/entities/channels';

import {useDockedThreads} from './dock';
import {BarItem} from './bar_item';

type Props = {
    id: string;
};

const getDisplayName = makeGetDisplayName();

const ThreadItem = ({id}: Props): React.ReactElement | null => {
    const dispatch = useDispatch();
    const {goToInChannel} = useThreadRouting();
    const {formatMessage} = useIntl();
    const currentUserId = useSelector(getCurrentUserId);

    const [isOpen, setIsOpen] = useState(false);

    // return {
    //     post,
    //     channel: getChannel(state, {id: post.channel_id}),
    //     currentRelativeTeamUrl: getCurrentRelativeTeamUrl(state),
    //     displayName: getDisplayName(state, post.user_id, true),
    //     postsInThread: getPostsForThread(state, post.id),
    //     thread: getThread(state, threadId),
    // };

    const post = useSelector((state: GlobalState) => getPost(state, id));
    const thread = useSelector((state: GlobalState) => getThread(state, id));
    const name = useSelector((state: GlobalState) => getDisplayName(state, post?.user_id, true));

    const channel = useSelector((state: GlobalState) => getChannel(state, post?.channel_id));

    const {close} = useDockedThreads();

    useEffect(() => {
        if (!channel && post?.channel_id) {
            dispatch(fetchChannel(post.channel_id));
        }
    }, [channel, post?.channel_id]);

    const participantIds = useMemo(() => {
        const ids = (thread?.participants || []).flatMap(({id}) => {
            if (id === post?.user_id) {
                return [];
            }
            return id;
        }).reverse();
        return [post?.user_id, ...ids];
    }, [post, thread?.participants]);

    const unreadTimestamp = post?.edit_at || post?.create_at;

    // const selectHandler = useCallback((e: MouseEvent<HTMLDivElement>) => {
    //     if (e.altKey) {
    //         const hasUnreads = thread ? Boolean(thread.unread_replies) : false;
    //         const lastViewedAt = hasUnreads ? Date.now() : unreadTimestamp;

    //         dispatch(manuallyMarkThreadAsUnread(threadId, lastViewedAt));
    //         if (hasUnreads) {
    //             dispatch(updateThreadRead(currentUserId, currentTeamId, threadId, Date.now()));
    //         } else {
    //             dispatch(markLastPostInThreadAsUnread(currentUserId, currentTeamId, threadId));
    //         }
    //     } else {
    //         select(threadId);
    //     }
    // }, [
    //     currentUserId,
    //     currentTeamId,
    //     threadId,
    //     thread,
    //     updateThreadRead,
    //     unreadTimestamp,
    // ]);

    // const imageProps = useMemo(() => ({
    //     onImageHeightChanged: () => {},
    //     onImageLoaded: () => {},
    // }), []);

    // const goToInChannelHandler = useCallback((e: MouseEvent) => {
    //     e.stopPropagation();
    //     goToInChannel(threadId);
    // }, [threadId]);

    // const handleFormattedTextClick = useCallback((e) => {
    //     Utils.handleFormattedTextClick(e, currentRelativeTeamUrl);
    // }, [currentRelativeTeamUrl]);

    if (!post) {
        return null;
    }

    // const {
    //     unread_replies: newReplies,
    //     unread_mentions: newMentions,
    //     last_reply_at: lastReplyAt,
    //     reply_count: totalReplies,
    //     is_following: isFollowing,
    // } = thread;

    // // if we have the whole thread, get the posts in it, sorted from newest to oldest.
    // // First post is latest reply. Use that timestamp
    // if (postsInThread.length > 1) {
    //     const p = postsInThread[0];
    //     unreadTimestamp = p.edit_at || p.create_at;
    // }

    return (
        <div
            className={classNames({isOpen})}
            css={`
                position: relative;
                &.isOpen {
                    width: 400px;
                }

            `}
        >
            {isOpen && (
                <div
                    css={`
                        position: absolute;
                        bottom: 100%;
                        z-index: 8;
                        right: 0;
                        width: 400px;
                        height: 600px;
                        background: var(--global-header-background);
                        border: 1px solid rgba(var(--sidebar-text-rgb), 0.08);
                        .ThreadViewer {
                            width: 100%;
                            height: 100%;
                        }
                    `}
                >
                    <ThreadViewer rootPostId={id}/>
                </div>
            )}

            <ThreadItemRoot
                onClick={() => setIsOpen((isOpen) => !isOpen)}
            >
                <span
                    css={`
                        white-space: nowrap;
                        svg {
                            vertical-align: middle;
                        }
                    `}
                >
                    <MessageTextOutlineIcon size={16}/>
                    <span
                        css={`
                            margin-left: 6px;
                        `}
                    >
                        {name}
                        {' | '}
                        {channel?.display_name}
                        {' '}
                    </span>
                </span>
                <button
                    className='style--none'
                    onClickCapture={() => close(id)}
                    css={`
                        && {
                            padding: 7px !important;
                        }
                    `}
                >
                    <CloseIcon size={18}/>
                </button>
            </ThreadItemRoot>
        </div>
    );
};

const ThreadItemRoot = styled(BarItem)`
    padding-right: 0;
`;

export default memo(ThreadItem);
