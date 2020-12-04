// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, ComponentProps, useCallback, MouseEvent} from 'react';
import {FormattedMessage} from 'react-intl';
import {useHistory, useRouteMatch} from 'react-router-dom';
import classNames from 'classnames';
import {useSelector} from 'react-redux';

import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {getUser} from 'mattermost-redux/selectors/entities/users';
import {getThread} from 'mattermost-redux/selectors/entities/threads';

import './thread_item.scss';

import Badge from 'components/widgets/badges/badge';
import Timestamp from 'components/timestamp';
import Avatars from 'components/widgets/users/avatars';
import Button from 'components/threading/common/button';
import SimpleTooltip from 'components/widgets/simple_tooltip';

import ThreadMenu from '../thread_menu';

import {THREADING_TIME} from '../../common/options';
import {GlobalState} from 'types/store';

type Props = {
    threadId: string;
    isSelected: boolean;
} & Pick<ComponentProps<typeof ThreadMenu>, 'actions'>;

const ThreadItem = ({
    threadId,
    isSelected,
}: Props) => {
    const {params: {team}} = useRouteMatch<{team: string}>();
    const history = useHistory();

    const {
        unread_replies: newReplies,
        unread_mentions: newMentions,
        last_reply_at: lastReplyAt,
        reply_count: totalReplies,
        participants,
        post: {
            channel_id: channelId,
            user_id: userId,
            message,
        },
    } = useSelector((state: GlobalState) => getThread(state, threadId));
    const channel = useSelector((state: GlobalState) => getChannel(state, channelId));
    const user = useSelector((state: GlobalState) => getUser(state, userId));
    return (
        <article
            className={classNames('ThreadItem', {
                'has-unreads': newReplies,
                'is-selected': isSelected,
            })}
            tabIndex={0}
            onClick={useCallback(() => {
                history.replace(`/${team}/threads/${threadId}`);
            }, [])}
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
                {`${user.first_name} ${user.last_name}`}
                {Boolean(channel) && (
                    <Badge
                        onClick={useCallback((e: MouseEvent) => {
                            e.stopPropagation();
                            history.push(`/${team}/pl/${threadId}`);
                        }, [history])}
                    >
                        {channel.display_name}
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
                    isSaved={false}
                    isFollowing={true}
                    hasUnreads={Boolean(newReplies)}
                    actions={{}}
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
            <p>
                {message}
            </p>
            {Boolean(totalReplies) && (
                <div className='activity'>
                    <Avatars
                        users={participants.map((participant) => ({
                            username: participant.username,
                            name: `${participant.first_name} ${participant.last_name}`,
                            url: `http://localhost:9005/api/v4/users/${participant.id}/image?_=0`,
                        }))}
                        totalUsers={0}
                        size='xs'
                    />
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
