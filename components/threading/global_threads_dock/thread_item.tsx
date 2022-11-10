// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback, useEffect, MouseEvent, useMemo, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import classNames from 'classnames';
import {useDispatch, useSelector} from 'react-redux';

import {CloseCircleIcon} from '@mattermost/compass-icons/components';

import {getChannel as fetchChannel} from 'mattermost-redux/actions/channels';
import {getInt} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUserId, makeGetDisplayName} from 'mattermost-redux/selectors/entities/users';
import {getMissingProfilesByIds} from 'mattermost-redux/actions/users';
import {markLastPostInThreadAsUnread, updateThreadRead} from 'mattermost-redux/actions/threads';

import * as Utils from 'utils/utils';
import {CrtTutorialSteps, Preferences} from 'utils/constants';
import {GlobalState} from 'types/store';
import {getIsMobileView} from 'selectors/views/browser';

import {manuallyMarkThreadAsUnread} from 'actions/views/threads';

import {UserThread} from '@mattermost/types/threads';
import {Post} from '@mattermost/types/posts';
import {Channel} from '@mattermost/types/channels';

import {getPost} from 'mattermost-redux/selectors/entities/posts';

import {getThread} from 'mattermost-redux/selectors/entities/threads';

import {useThreadRouting} from '../hooks';

import ThreadViewer from '../thread_viewer';

import {getChannel} from 'mattermost-redux/selectors/entities/channels';

import {BarItemButton, useDockedThreads} from './dock';

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

    // useEffect(() => {
    //     if (channel?.teammate_id) {
    //         dispatch(getMissingProfilesByIds([channel.teammate_id]));
    //     }
    // }, [channel?.teammate_id]);

    // useEffect(() => {
    //     if (!channel && thread?.post.channel_id) {
    //         dispatch(fetchChannel(thread.post.channel_id));
    //     }
    // }, [channel, thread?.post.channel_id]);

    // const participantIds = useMemo(() => {
    //     const ids = (thread?.participants || []).flatMap(({id}) => {
    //         if (id === post.user_id) {
    //             return [];
    //         }
    //         return id;
    //     }).reverse();
    //     return [post.user_id, ...ids];
    // }, [thread?.participants]);

    // let unreadTimestamp = post.edit_at || post.create_at;

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

                        background: var(--global-header-background);
                        border: 1px solid rgba(var(--sidebar-text-rgb), 0.08);


                        .ThreadViewer {
                            width: 400px;
                            height: 600px;
                        }
                    `}
                >
                    <ThreadViewer rootPostId={id}/>
                </div>
            )}

            <BarItemButton
                onClick={() => setIsOpen((isOpen) => !isOpen)}
            >
                {name}
                {' | '}
                {channel?.display_name}
                {' '}
                <button
                    className='style--none'
                    onClickCapture={() => close(id)}
                >
                    <CloseCircleIcon size={16}/>
                </button>
            </BarItemButton>
        </div>
    );
};

export default memo(ThreadItem);
