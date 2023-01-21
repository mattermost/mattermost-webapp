// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback, useEffect, useMemo, useState, MouseEvent} from 'react';
import {useIntl} from 'react-intl';
import classNames from 'classnames';
import {useDispatch, useSelector} from 'react-redux';

import {CloseIcon, ArrowCollapseIcon, ArrowExpandIcon, MessageTextOutlineIcon, MinusBoxIcon, MinusIcon} from '@mattermost/compass-icons/components';

import styled from 'styled-components';

import {getChannel as fetchChannel} from 'mattermost-redux/actions/channels';
import {getCurrentUserId, makeGetDisplayName} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'types/store';

import {getPost} from 'mattermost-redux/selectors/entities/posts';

import {getThread} from 'mattermost-redux/selectors/entities/threads';

import {useThreadRouting} from '../hooks';

import ThreadViewer from '../thread_viewer';

import {getChannel} from 'mattermost-redux/selectors/entities/channels';

import {manuallyMarkThreadAsUnread} from 'actions/views/threads';
import {markLastPostInThreadAsUnread, updateThreadRead} from 'mattermost-redux/actions/threads';
import {getCurrentTeamId} from '../../../../mattermost-mobile/app/mm-redux/selectors/entities/common';

import {prefetchThread} from 'actions/views/rhs';

import {BarItem} from './bar_item';
import {useDockedThreads} from './dock';

type Props = {
    id: string;
};

const getDisplayName = makeGetDisplayName();

const ThreadItem = ({id}: Props): React.ReactElement | null => {
    const dispatch = useDispatch();
    const currentTeamId = useSelector(getCurrentTeamId);
    const {open, close, isOpen, minimize, isExpanded, expand} = useDockedThreads(id);
    const {goToInChannel} = useThreadRouting();
    const {formatMessage} = useIntl();
    dispatch(prefetchThread(id));

    const currentUserId = useSelector(getCurrentUserId);
    const post = useSelector((state: GlobalState) => getPost(state, id));
    const thread = useSelector((state: GlobalState) => getThread(state, id));
    const name = useSelector((state: GlobalState) => getDisplayName(state, post?.user_id, true));

    const channel = useSelector((state: GlobalState) => getChannel(state, post?.channel_id));

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

    const selectHandler = useCallback((e: MouseEvent<HTMLElement>) => {
        if (e.altKey) {
            const hasUnreads = thread ? Boolean(thread.unread_replies) : false;
            const lastViewedAt = hasUnreads ? Date.now() : unreadTimestamp;

            dispatch(manuallyMarkThreadAsUnread(id, lastViewedAt));
            if (hasUnreads) {
                dispatch(updateThreadRead(currentUserId, currentTeamId, id, Date.now()));
            } else {
                dispatch(markLastPostInThreadAsUnread(currentUserId, currentTeamId, id));
            }
        } else if (isOpen) {
            minimize(id);
        } else {
            open(id);
        }
    }, [
        currentUserId,
        currentTeamId,
        isOpen,
        id,
        thread,
        updateThreadRead,
        unreadTimestamp,
    ]);

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

    if (!post || !thread) {
        return null;
    }

    const {
        unread_replies: newReplies,
        unread_mentions: newMentions,
        last_reply_at: lastReplyAt,
        reply_count: totalReplies,
        is_following: isFollowing,
    } = thread;

    const itemBar = (
        <ThreadItemBar
            onClick={selectHandler}
            onAuxClick={(e) => e.button === 1 && close(id)}
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
                {Boolean(newMentions || newReplies) && (
                    <div className='indicator'>
                        {newMentions ? (
                            <div className={classNames('dot-mentions', {over: newMentions > 99})}>
                                {Math.min(newMentions, 99)}
                                {newMentions > 99 && '+'}
                            </div>
                        ) : (
                            <div className='dot-unreads'/>
                        )}
                    </div>
                )}
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
            <div>
                {isOpen && (
                    <>
                        <button
                            className='style--none'
                            onClickCapture={() => minimize(id)}
                            css={`
                                && {
                                    padding: 7px !important;
                                }
                            `}
                        >
                            {<MinusIcon size={18}/>}
                        </button>
                        <button
                            className='style--none'
                            onClickCapture={() => expand(id)}
                            css={`
                                && {
                                    padding: 7px !important;
                                }
                            `}
                        >
                            {isExpanded ? <ArrowCollapseIcon size={18}/> : <ArrowExpandIcon size={18}/>}
                        </button>
                    </>
                )}
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
            </div>
        </ThreadItemBar>
    );

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
            className={classNames({isOpen, isExpanded})}
            css={`
                position: relative;
                transition: width 0.2s ease-in-out;
                &.isOpen {
                    width: 350px;

                    &.isExpanded {
                        width: 475px;
                    }
                    flex-shrink: 0;
                }

            `}
        >

            {isOpen ? (
                <div
                    css={`
                        transition: width 0.2s ease-in-out, height 0.2s ease-in-out;
                        position: absolute;
                        bottom: 0;
                        z-index: 8;
                        right: 0;
                        width: 350px;
                        height: 500px;
                        .isExpanded & {
                            width: 475px;
                            height: 750px;
                        }
                        max-height: calc(100vh - 8px);
                        background: var(--center-channel-bg);
                        .ThreadViewer {
                            width: 100%;
                            height: calc(100% - 28px);
                            border: 1px solid rgba(var(--center-channel-color-rgb), 0.12);
                            border-width: 0 1px 1px 1px;
                            border-radius: 0 0 4px 4px;
                        }
                    `}
                >
                    {itemBar}
                    <ThreadViewer rootPostId={id}/>
                </div>
            ) : itemBar}
        </div>
    );
};

const ThreadItemBar = styled(BarItem)`
    padding-right: 0;
    width: 100%;
    .isOpen & {
        border-radius: 3px 3px 0 0;
    }


    .dot-unreads {
        display: inline-block;
        width: 8px;
        height: 8px;
        margin: 0 8px;
        background: rgba(var(--sidebar-text-active-border-rgb), 1);
        border-radius: 50%;
        text-align: center;
    }

    .dot-mentions {
        display: inline-block;
        width: 16px;
        height: 16px;
        background: rgba(var(--button-bg-rgb), 1);
        border-radius: 50%;
        color: rgba(var(--button-color-rgb), 1);
        font-size: 10px;
        font-weight: 700;
        line-height: 16px;
        text-align: center;

        &.over {
            font-size: 8px;
        }
    }

    .indicator {
        position: absolute;
        top: 1px;
        left: 1px;
        display: grid;
        width: 16px;
        height: 16px;
        place-content: center;
    }
`;

export default memo(ThreadItem);
