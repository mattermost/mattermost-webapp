// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback, useEffect, useMemo} from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import './thread_footer.scss';

import {GlobalState} from 'types/store';

import {$ID} from 'mattermost-redux/types/utilities';
import {Post} from 'mattermost-redux/types/posts';
import {threadIsSynthetic, UserThread} from 'mattermost-redux/types/threads';

import {setThreadFollow, getThread as fetchThread} from 'mattermost-redux/actions/threads';
import {selectPost} from 'actions/views/rhs';

import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getThreadOrSynthetic} from 'mattermost-redux/selectors/entities/threads';
import {getPost} from 'mattermost-redux/selectors/entities/posts';

import Avatars from 'components/widgets/users/avatars';
import Timestamp from 'components/timestamp';
import SimpleTooltip from 'components/widgets/simple_tooltip';
import Button from 'components/threading/common/button';
import FollowButton from 'components/threading/common/follow_button';

import {THREADING_TIME} from 'components/threading/common/options';
type Props = {
    threadId: $ID<UserThread>;
};

function ThreadFooter({
    threadId,
}: Props) {
    const dispatch = useDispatch();
    const currentTeamId = useSelector(getCurrentTeamId);
    const currentUserId = useSelector(getCurrentUserId);
    const post = useSelector((state: GlobalState) => getPost(state, threadId));
    const thread = useSelector((state: GlobalState) => getThreadOrSynthetic(state, post));

    useEffect(() => {
        if (threadIsSynthetic(thread) && thread.is_following && thread.reply_count > 0) {
            dispatch(fetchThread(currentUserId, currentTeamId, threadId));
        }
    }, []);

    const {
        participants,
        reply_count: totalReplies = 0,
        last_reply_at: lastReplyAt,
        is_following: isFollowing = false,
        post: {
            channel_id: channelId,
        },
    } = thread;
    const participantIds = useMemo(() => participants?.map(({id}) => id), [participants]);

    const handleReply = useCallback((e) => {
        e.stopPropagation();
        dispatch(selectPost({id: threadId, channel_id: channelId} as Post));
    }, [threadId, channelId]);

    const handleFollowing = useCallback((e) => {
        e.stopPropagation();
        dispatch(setThreadFollow(currentUserId, currentTeamId, threadId, !isFollowing));
    }, [isFollowing]);

    return (
        <div className='ThreadFooter'>
            {!isFollowing || threadIsSynthetic(thread) || !thread.unread_replies ? (
                <div className='indicator'/>
            ) : (
                <SimpleTooltip
                    id='threadFooterIndicator'
                    content={
                        <FormattedMessage
                            id='threading.numNewMessages'
                            defaultMessage='{newReplies, plural, =0 {no unread messages} =1 {one unread message} other {# unread messages}}'
                            values={{newReplies: thread.unread_replies}}
                        />
                    }
                >
                    <div
                        className='indicator'
                        tabIndex={0}
                    >
                        <div className='dot-unreads'/>
                    </div>
                </SimpleTooltip>
            )}

            {participantIds ? (
                <Avatars
                    userIds={participantIds}
                    size='sm'
                />
            ) : null}

            {thread.reply_count > 0 && (
                <Button
                    onClick={handleReply}
                    className='ReplyButton separated'
                    prepend={
                        <span className='icon'>
                            <i className='icon-reply-outline'/>
                        </span>
                    }
                >
                    <FormattedMessage
                        id='threading.numReplies'
                        defaultMessage='{totalReplies, plural, =0 {Reply} =1 {# reply} other {# replies}}'
                        values={{totalReplies}}
                    />
                </Button>
            )}

            <FollowButton
                isFollowing={isFollowing}
                className='separated'
                onClick={handleFollowing}
            />

            {Boolean(lastReplyAt) && (
                <Timestamp
                    value={lastReplyAt}
                    {...THREADING_TIME}
                >
                    {({formatted}) => (
                        <span className='Timestamp separated alt-visible'>
                            <FormattedMessage
                                id='threading.footer.lastReplyAt'
                                defaultMessage='Last reply {formatted}'
                                values={{formatted}}
                            />
                        </span>
                    )}
                </Timestamp>
            )}
        </div>
    );
}

export default memo(ThreadFooter);
