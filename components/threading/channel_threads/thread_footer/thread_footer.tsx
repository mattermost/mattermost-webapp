// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback, ComponentProps, useMemo} from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch} from 'react-redux';

import './thread_footer.scss';

import {$ID} from 'mattermost-redux/types/utilities';
import {Post} from 'mattermost-redux/types/posts';
import {UserThread} from 'mattermost-redux/types/threads';
import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';

import {setThreadFollow} from 'mattermost-redux/actions/threads';

import {selectPost} from 'actions/views/rhs';

import Avatars from 'components/widgets/users/avatars';
import Timestamp from 'components/timestamp';
import SimpleTooltip from 'components/widgets/simple_tooltip';

import Button from 'components/threading/common/button';
import FollowButton from 'components/threading/common/follow_button';

import {THREADING_TIME} from 'components/threading/common/options';
import {useThreadRouting} from 'components/threading/hooks';

type Props = {
    threadId: $ID<UserThread>;
    channelId: $ID<Channel>;
    participants: Array<{id: $ID<UserProfile>}>; // Post['participants']
    totalParticipants?: number;
    totalReplies: number;
    newReplies: number;
    lastReplyAt: ComponentProps<typeof Timestamp>['value'];
    isFollowing: boolean;
};

function ThreadFooter({
    threadId,
    channelId,
    participants,
    totalParticipants = 0,
    totalReplies = 0,
    newReplies = 0,
    lastReplyAt,
    isFollowing,
}: Props) {
    const participantIds = useMemo(() => participants?.map(({id}) => id), [participants]);
    const dispatch = useDispatch();
    const {currentUserId, currentTeamId} = useThreadRouting();

    return (
        <div className='ThreadFooter'>
            {newReplies ? (
                <SimpleTooltip
                    id='threadFooterIndicator'
                    content={
                        <FormattedMessage
                            id='threading.numNewMessages'
                            defaultMessage='{newReplies, plural, =0 {no unread messages} =1 {one unread message} other {# unread messages}}'
                            values={{newReplies}}
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
            ) : (
                <div className='indicator'/>
            )}

            {participantIds ? (
                <Avatars
                    userIds={participantIds}
                    totalUsers={totalParticipants}
                    size='sm'
                />
            ) : null}

            <Button

                onClick={useCallback(() => {
                    dispatch(selectPost({id: threadId, channel_id: channelId} as Post));
                }, [threadId, channelId])}
                className='separated'
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

            <FollowButton
                isFollowing={isFollowing}
                className='separated'

                onClick={useCallback(() => {
                    dispatch(setThreadFollow(currentUserId, currentTeamId, threadId, !isFollowing));
                }, [isFollowing])}
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
