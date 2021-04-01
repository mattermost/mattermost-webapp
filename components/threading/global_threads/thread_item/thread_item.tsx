// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback, useEffect, MouseEvent, useMemo} from 'react';
import {FormattedMessage} from 'react-intl';
import classNames from 'classnames';
import {useSelector, useDispatch} from 'react-redux';

import {UserThread} from 'mattermost-redux/types/threads';
import {$ID} from 'mattermost-redux/types/utilities';

import {makeGetChannel} from 'mattermost-redux/selectors/entities/channels';
import {getChannel as fetchChannel} from 'mattermost-redux/actions/channels';
import {getMissingProfilesByIds} from 'mattermost-redux/actions/users';

import {makeGetDisplayName} from 'mattermost-redux/selectors/entities/users';
import {getThread} from 'mattermost-redux/selectors/entities/threads';
import {getPost} from 'mattermost-redux/selectors/entities/posts';

import './thread_item.scss';

import Badge from 'components/widgets/badges/badge';
import Timestamp from 'components/timestamp';
import Avatars from 'components/widgets/users/avatars';
import Button from 'components/threading/common/button';
import SimpleTooltip from 'components/widgets/simple_tooltip';

import Markdown from 'components/markdown';

import ThreadMenu from '../thread_menu';

import {THREADING_TIME} from '../../common/options';
import {GlobalState} from 'types/store';
import {useThreadRouting} from '../../hooks';

type Props = {
    threadId: $ID<UserThread>;
    isSelected: boolean;
};

const markdownPreviewOptions = {
    singleline: true,
    mentionHighlight: false,
    atMentions: false,
};

const getChannel = makeGetChannel();
const getDisplayName = makeGetDisplayName();

function useLogic(threadId: string) {
    const {select, goToInChannel} = useThreadRouting();
    const dispatch = useDispatch();

    const thread = useSelector((state: GlobalState) => getThread(state, threadId));
    const post = useSelector((state: GlobalState) => getPost(state, threadId));
    const channel = useSelector((state: GlobalState) => getChannel(state, {id: post.channel_id}));
    const displayName = useSelector((state: GlobalState) => getDisplayName(state, post.user_id, true));

    const participantIds = useMemo(() => thread?.participants?.map(({id}) => id), [thread?.participants]);

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

    const selectHandler = useCallback(() => select(threadId), []);
    const goToInChannelHandler = useCallback((e: MouseEvent) => {
        e.stopPropagation();
        goToInChannel(threadId);
    }, [history]);

    return {
        thread,
        post,
        channel,
        displayName,
        participantIds,
        selectHandler,
        goToInChannelHandler,
    };
}

const ThreadItem = ({
    threadId,
    isSelected,
}: Props) => {
    const {
        thread,
        post,
        channel,
        displayName,
        participantIds,
        selectHandler,
        goToInChannelHandler,
    } = useLogic(threadId);

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

    return (
        <article
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
            <span className='menu-anchor alt-visible'>
                <ThreadMenu
                    threadId={threadId}
                    isFollowing={isFollowing ?? false}
                    hasUnreads={Boolean(newReplies)}
                    unreadTimestamp={post.edit_at || post.create_at}
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
            </span>
            <div className='preview'>
                <Markdown
                    message={post?.message ?? '(message deleted)'}
                    options={markdownPreviewOptions}
                />
            </div>
            {Boolean(totalReplies) && (
                <div className='activity'>
                    {participantIds?.length ? (
                        <Avatars
                            userIds={participantIds}
                            size='xs'
                        />
                    ) : null}
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
                </div>
            )}
        </article>
    );
};

export default memo(ThreadItem);
