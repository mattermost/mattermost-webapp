// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, ComponentProps, useState} from 'react';
import {useIntl} from 'react-intl';
import {isEmpty} from 'lodash';
import {Link, useRouteMatch, useHistory} from 'react-router-dom';
import {useSelector} from 'react-redux';

import {Post} from 'mattermost-redux/types/posts';
import {UserProfile} from 'mattermost-redux/types/users';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getPost} from 'mattermost-redux/selectors/entities/posts';

import {useStickyState} from 'stores/hooks';

import {GlobalState} from 'types/store';

import RHSNavigation from 'components/rhs_navigation';

import Header from 'components/widgets/header';
import NoResultsIndicator from 'components/no_results_indicator/no_results_indicator';

import ChatIllustration from '../common/chat_illustration.svg';

import ThreadViewer from './thread_viewer';

const ChatIllustrationImg = (
    <img
        draggable={false}
        src={ChatIllustration}
    />
);

import ThreadList from './thread_list';
import ThreadPane from './thread_pane';
import ThreadItem from './thread_item';

import './global_threads.scss';

type Props = {
    threads?: Thread[];
    numUnread: number;
    actions: {

    };
} & Pick<ComponentProps<typeof ThreadItem & typeof ThreadPane>, 'actions'>;

const GlobalThreads = ({
    threads,
    numUnread = 1,
    actions = {},
}: Props) => {
    const {formatMessage} = useIntl();
    const {url, params: {team, threadIdentifier}} = useRouteMatch<{team: string, threadIdentifier?: string}>();
    const history = useHistory();
    const [filter, setFilter] = useStickyState('', 'globalThreads_filter');
    const currentUserId = useSelector(getCurrentUserId);
    const selectedPost = useSelector((state: GlobalState) => getPost(state, threadIdentifier ?? ''));

    return (
        <div
            id='app-content'
            className='GlobalThreads app__content'
        >
            <Header
                level={2}
                className={'GlobalThreads___header'}
                heading={formatMessage({id: 'globalThreads.heading', defaultMessage: 'Followed threads'})}
                subtitle={formatMessage({id: 'globalThreads.subtitle', defaultMessage: 'Threads you’re participating in will automatically show here'})}
                right={<RHSNavigation/>}
            />
            {isEmpty(threads) ? (
                <div className='no-results__holder'>
                    <NoResultsIndicator
                        iconGraphic={ChatIllustrationImg}
                        title={'No followed threads yet'}
                        subtitle={'Any threads you are mentioned in or have participated in will show here along with any threads you have followed.'}
                    />
                </div>
            ) : (
                <>
                    <ThreadList
                        someUnread={false}
                        currentFilter={filter}
                        actions={{...actions, setFilter}}
                    >
                        {threads?.map(({
                            id,
                            reply_count: replyCount,
                            participants,
                            unreadReplies,
                            unreadMentions,
                            last_reply_at: lastReplyAt,
                            post: {
                                root_id: rootId,
                                channel_id: channelId,
                                message,
                                user_id: userId,
                            },
                        }) => (
                            <ThreadItem
                                key={rootId}
                                rootPostUserId={userId}
                                channelId={channelId}
                                previewText={message}
                                participants={participants.map((participant) => ({
                                    username: participant.username,
                                    name: `${participant.first_name} ${participant.last_name}`,
                                    url: 'http://localhost:9005/api/v4/users/4wcwm9k3qi8t9836bodcxn5ufa/image?_=0',
                                }))}
                                totalReplies={replyCount}
                                newReplies={unreadReplies}
                                newMentions={unreadMentions}
                                lastReplyAt={lastReplyAt}
                                isFollowing={true}
                                isSaved={false}
                                isSelected={threadIdentifier === id}
                                actions={{
                                    ...actions,
                                    select: () => {
                                        history.replace(`/${team}/threads/${id}`);
                                    },
                                }}
                            />
                        ))}
                    </ThreadList>
                    {selectedPost ? (
                        <ThreadPane
                            post={selectedPost}
                            hasUnreads={false}
                            isFollowing={true}
                            isSaved={false}
                            actions={actions}
                        >
                            <ThreadViewer
                                currentUserId={currentUserId}
                                rootPostId={selectedPost.id}
                                useRelativeTimestamp={true}
                            />
                        </ThreadPane>
                    ) : (
                        <div className='no-results__holder'>
                            <NoResultsIndicator
                                iconGraphic={ChatIllustrationImg}
                                title={formatMessage({
                                    id: 'globalThreads.threadPane.unselectedTitle',
                                    defaultMessage: '{numUnread, plural, =0 {Looks like you’re all caught up} other {Catch up on your threads}}',
                                }, {numUnread})}
                                subtitle={formatMessage({
                                    id: 'globalThreads.threadPane.unreadMessageLink',
                                    defaultMessage: `
                                    You have
                                    {numUnread, plural,
                                        =0 {no unread threads}
                                        =1 {<link>{numUnread} thread</link>}
                                        other {<link>{numUnread} threads</link>}
                                    }
                                    {numUnread, plural,
                                        =0 {}
                                        other {with unread messages}
                                    }
                                    `,
                                }, {
                                    numUnread,
                                    link: (...chunks) => (
                                        <Link
                                            key='single'
                                            to={url}
                                        >
                                            {chunks}
                                        </Link>
                                    ),
                                })}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default memo(GlobalThreads);
