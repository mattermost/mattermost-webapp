// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback, useEffect, MouseEvent, useMemo} from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';
import {useDispatch} from 'react-redux';

import {Channel} from 'mattermost-redux/types/channels';
import {Post} from 'mattermost-redux/types/posts';
import {UserThread} from 'mattermost-redux/types/threads';
import {$ID} from 'mattermost-redux/types/utilities';

import {getChannel as fetchChannel} from 'mattermost-redux/actions/channels';
import {getMissingProfilesByIds} from 'mattermost-redux/actions/users';

import * as Utils from 'utils/utils';

import './thread_item.scss';

import Badge from 'components/widgets/badges/badge';
import Timestamp from 'components/timestamp';
import Avatars from 'components/widgets/users/avatars';
import Button from 'components/threading/common/button';
import SimpleTooltip from 'components/widgets/simple_tooltip';

import Markdown from 'components/markdown';

import ThreadMenu from '../thread_menu';

import {THREADING_TIME} from '../../common/options';
import {useThreadRouting} from '../../hooks';

export type OwnProps = {
    isSelected: boolean;
    threadId: $ID<UserThread>;
    style?: any;
};

type Props = {
    channel: Channel;
    currentRelativeTeamUrl: string;
    displayName: string;
    post: Post;
    postsInThread: Post[];
    thread: UserThread;
};

const markdownPreviewOptions = {
    singleline: true,
    mentionHighlight: false,
    atMentions: false,
};

function ThreadItem({
    channel,
    currentRelativeTeamUrl,
    displayName,
    isSelected,
    post,
    postsInThread,
    style,
    thread,
    threadId,
}: Props & OwnProps): React.ReactElement|null {
    const dispatch = useDispatch();
    const {select, goToInChannel} = useThreadRouting();

    useEffect(() => {
        if (channel?.teammate_id) {
            dispatch(getMissingProfilesByIds([channel.teammate_id]));
        }
    }, [channel?.teammate_id]);

    useEffect(() => {
        if (!channel && thread?.post.channel_id) {
            dispatch(fetchChannel(thread.post.channel_id));
        }
    }, [channel, thread?.post.channel_id]);

    const participantIds = useMemo(() => thread?.participants?.map(({id}) => id), [thread?.participants]);

    const selectHandler = useCallback(() => select(threadId), []);

    const goToInChannelHandler = useCallback((e: MouseEvent) => {
        e.stopPropagation();
        goToInChannel(threadId);
    }, [threadId]);

    const handleFormattedTextClick = useCallback((e) => {
        Utils.handleFormattedTextClick(e, currentRelativeTeamUrl);
    }, [currentRelativeTeamUrl]);

    if (!thread || !post) {
        return null;
    }

    const {
        unread_replies: newReplies,
        unread_mentions: newMentions,
        last_reply_at: lastReplyAt,
        reply_count: totalReplies,
        is_following: isFollowing,
    } = thread;

    let unreadTimestamp = post.edit_at || post.create_at;

    // if we have the whole thread, get the posts in it, sorted from newest to oldest.
    // Last post - root post, second to last post - oldest reply. Use that timestamp
    if (postsInThread.length > 1) {
        const p = postsInThread[postsInThread.length - 2];
        unreadTimestamp = p.edit_at || p.create_at;
    }

    return (
        <article
            style={style}
            className={classNames('ThreadItem', {
                'has-unreads': newReplies,
                'is-selected': isSelected,
            })}
            tabIndex={0}
            onClick={selectHandler}
        >
            <h1>
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
                <span>{displayName}</span>
                {Boolean(channel) && (
                    <Badge
                        onClick={goToInChannelHandler}
                    >
                        {channel?.display_name}
                    </Badge>
                )}
                <Timestamp
                    {...THREADING_TIME}
                    className='alt-hidden'
                    value={lastReplyAt}
                    capitalize={true}
                />
            </h1>
            <div className='menu-anchor alt-visible'>
                <ThreadMenu
                    threadId={threadId}
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
                        <Button className='Button___icon'>
                            <i className='Icon icon-dots-vertical'/>
                        </Button>
                    </SimpleTooltip>
                </ThreadMenu>
            </div>
            <div
                aria-readonly='true'
                className='preview'
                dir='auto'
                tabIndex={0}
                onClick={handleFormattedTextClick}
            >
                <Markdown
                    message={post?.message ?? '(message deleted)'}
                    options={markdownPreviewOptions}
                />
            </div>
            <div className='activity'>
                {participantIds?.length ? (
                    <Avatars
                        userIds={participantIds}
                        size='xs'
                    />
                ) : null}
                {Boolean(totalReplies) && (
                    <>
                        {newReplies ? (
                            <FormattedMessage
                                id='threading.numNewReplies'
                                defaultMessage='{newReplies, plural, =1 {# new reply} other {# new replies}}'
                                values={{newReplies}}
                            />
                        ) : (
                            <FormattedMessage
                                id='threading.numReplies'
                                defaultMessage='{totalReplies, plural, =0 {Reply} =1 {# reply} other {# replies}}'
                                values={{totalReplies}}
                            />
                        )}
                    </>
                )}
            </div>
        </article>
    );
}

export default memo(ThreadItem);
