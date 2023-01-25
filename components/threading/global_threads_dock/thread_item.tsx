// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback, useEffect, useMemo, MouseEvent} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import classNames from 'classnames';
import {useDispatch, useSelector} from 'react-redux';

import {CloseIcon, ArrowCollapseIcon, ArrowExpandIcon, MessageTextOutlineIcon, OpenInNewIcon, DotsHorizontalIcon, MessageCheckOutlineIcon} from '@mattermost/compass-icons/components';

import styled from 'styled-components';

import {getChannel as fetchChannel} from 'mattermost-redux/actions/channels';
import {getCurrentUserId, makeGetDisplayName} from 'mattermost-redux/selectors/entities/users';

import {GlobalState} from 'types/store';

import {getPost} from 'mattermost-redux/selectors/entities/posts';

import {getThread} from 'mattermost-redux/selectors/entities/threads';

import ThreadViewer from '../thread_viewer';

import {getChannel} from 'mattermost-redux/selectors/entities/channels';

import {manuallyMarkThreadAsUnread} from 'actions/views/threads';
import {markLastPostInThreadAsUnread, updateThreadRead} from 'mattermost-redux/actions/threads';
import {getCurrentTeamId} from '../../../../mattermost-mobile/app/mm-redux/selectors/entities/common';

import {prefetchThread, selectPost} from 'actions/views/rhs';

import {Preferences} from 'utils/constants';

import {get} from 'mattermost-redux/selectors/entities/preferences';

import {useGlobalKeyPressed} from 'utils/keyboard';

import SimpleTooltip from '../../widgets/simple_tooltip/simple_tooltip';

import {isMac} from 'utils/utils';

import ThreadItemMenu from './thread_item_menu';

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
    const {formatMessage} = useIntl();

    const isMetaPressed = useGlobalKeyPressed(isMac() ? 'Meta' : 'Ctrl');

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

    if (!post || !channel) {
        return null;
    }

    const isFollowing = thread?.is_following ?? post?.is_following;

    const {
        unread_replies: newReplies,
        unread_mentions: newMentions,
        last_reply_at: lastReplyAt,
        reply_count: totalReplies,
    } = thread ?? {};

    const icon = isFollowing ? <MessageCheckOutlineIcon size={16}/> : <MessageTextOutlineIcon size={16}/>;

    const itemBar = (
        <ThreadItemBar
            onClick={selectHandler}
            onAuxClick={(e) => e.button === 1 && close(id)}
        >
            <span
                css={`
                    white-space: nowrap;
                    position: relative;
                    display: inline-flex;
                    svg {
                        vertical-align: middle;
                    }
                `}
            >
                {isFollowing && (newMentions || newReplies) ? (
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
                ) : icon}
                <span
                    css={`
                        margin-left: 6px;
                        text-overflow: ellipsis;
                        display: inline-block;
                        overflow: hidden;
                        width: 15rem;
                        line-height: 1;
                        .isOpen & {
                            width: 19rem;
                            transition: width 0.2s ease-in-out;
                        }
                        .isExpanded & {
                            width: 30rem;
                        }
                    `}
                >
                    {name}
                    {' | '}
                    {channel?.display_name}
                    {' '}
                </span>
            </span>
            <div
                css={`
                    .MenuWrapper {
                        display: inline-block;
                    }
                `}
            >
                {isOpen && (
                    <>
                        <ThreadItemMenu
                            threadId={id}
                            post={post}
                            isFollowing={isFollowing ?? false}
                            hasUnreads={Boolean(newReplies)}
                            unreadTimestamp={unreadTimestamp}
                        >
                            <SimpleTooltip
                                id='threadActionMenu'
                                content={(
                                    <FormattedMessage
                                        id='threading.threadItem.menu'
                                        defaultMessage='Actions'
                                    />
                                )}
                            >
                                <DockItemButton>
                                    <DotsHorizontalIcon size={18}/>
                                </DockItemButton>
                            </SimpleTooltip>
                        </ThreadItemMenu>
                        <SimpleTooltip
                            id='expand'
                            content={isExpanded ? formatMessage({id: 'globalDock.dockItem.collapse', defaultMessage: 'Collapse'}) : formatMessage({id: 'globalDock.dockItem.expand', defaultMessage: 'Expand'})}
                        >
                            <DockItemButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    expand(id);
                                }}
                            >
                                {isExpanded ? <ArrowCollapseIcon size={18}/> : <ArrowExpandIcon size={18}/>}
                            </DockItemButton>
                        </SimpleTooltip>

                    </>
                )}
                <SimpleTooltip
                    id='expand'
                    content={isMetaPressed ? formatMessage({id: 'globalDock.dockItem.moveToSidebar', defaultMessage: 'Move to sidebar'}) : formatMessage({id: 'globalDock.dockItem.close', defaultMessage: 'Close'})}
                >
                    <DockItemButton
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isMetaPressed) {
                                dispatch(selectPost(post));
                            }
                            close(id);
                        }}
                        onAuxClick={(e) => {
                            e.stopPropagation();
                            if (e.button === 1) {
                                dispatch(selectPost(post));
                                close(id);
                            }
                        }}
                    >
                        {isMetaPressed ? <OpenInNewIcon size={18}/> : <CloseIcon size={18}/>}
                    </DockItemButton>
                </SimpleTooltip>
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
                    width: 382px;

                    &.isExpanded {
                        width: 475px;
                    }
                    flex-shrink: 0;
                }
            `}
        >
            {isOpen ? (
                <article
                    css={`
                        border-radius: 4px 4px 0 0;
                        transition: width 0.2s ease-in-out, height 0.2s ease-in-out;
                        position: absolute;
                        bottom: 0;
                        z-index: 8;
                        right: 0;
                        width: 382px;
                        height: 500px;
                        .isExpanded & {
                            width: 475px;
                            height: 750px;
                        }
                        max-height: calc(100vh - 8px);
                        background: var(--center-channel-bg);
                        .ThreadViewer {
                            width: 100%;
                            height: calc(100% - 36px);
                            border: 1px solid rgba(var(--center-channel-color-rgb), 0.12);
                            border-width: 0 1px 1px 1px;
                            border-radius: 0 0 4px 4px;
                        }
                    `}
                >
                    {itemBar}
                    <ThreadViewer
                        rootPostId={id}
                        useRelativeTimestamp={true}
                    />
                </article>
            ) : itemBar}
        </div>
    );
};

const ThreadItemBar = styled(BarItem)`
    padding-right: 0;
    width: 100%;
    .isOpen & {
        border-radius: 3px 3px 0 0;
        height: 36px;
        padding-left: 12px;
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
        //position: absolute;
        /* top: -4px;
        left: 6px; */
        display: inline-grid;
        width: 16px;
        height: 16px;
        place-content: center;
    }
`;

export default memo(ThreadItem);

const DockItemButton = styled.button.attrs({className: 'style--none'})`
    && {
        padding: 0;
        height: 36px;
        width: 36px;
    }
`;
