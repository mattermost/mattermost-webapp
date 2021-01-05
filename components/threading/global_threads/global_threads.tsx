// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useEffect, useState} from 'react';
import {useIntl} from 'react-intl';
import {isEmpty} from 'lodash';
import {Link, useRouteMatch} from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';

import classNames from 'classnames';

import {
    getThreadOrderInCurrentTeam,
    getUnreadThreadOrderInCurrentTeam,
    getThreadCountsInCurrentTeam,
    getThread,
} from 'mattermost-redux/selectors/entities/threads';

import {getThreads} from 'mattermost-redux/actions/threads';
import {selectChannel} from 'mattermost-redux/actions/channels';

import {GlobalState} from 'types/store/index';

import {useStickyState} from 'stores/hooks';
import {setSelectedThreadId} from 'actions/views/threads';

import RHSNavigation from 'components/rhs_navigation';
import Header from 'components/widgets/header';
import LoadingScreen from 'components/loading_screen';
import NoResultsIndicator from 'components/no_results_indicator';

import {useThreadRouting} from '../hooks';
import {ChatIllustrationImg, BalloonIllustrationImg} from '../common/graphics';

import ThreadViewer from './thread_viewer';
import ThreadList, {ThreadFilter} from './thread_list';
import ThreadPane from './thread_pane';
import ThreadItem from './thread_item';

import './global_threads.scss';

const GlobalThreads = () => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();

    const {url, params: {threadIdentifier}} = useRouteMatch<{threadIdentifier?: string}>();
    const [filter, setFilter] = useStickyState<ThreadFilter>('', 'globalThreads_filter');
    const {currentTeamId, currentUserId} = useThreadRouting();

    const counts = useSelector(getThreadCountsInCurrentTeam);
    const selectedThread = useSelector((state: GlobalState) => getThread(state, threadIdentifier));
    const threadIds = useSelector(getThreadOrderInCurrentTeam);
    const unreadThreadIds = useSelector(getUnreadThreadOrderInCurrentTeam);
    const numUnread = (counts && Math.max(counts.total_unread_mentions, counts.total_unread_replies)) || 0; // TODO incorrect: sum of unreads vs num of unread threads
    const [page, setPage] = useState(0);
    useEffect(() => {
        dispatch(getThreads(currentUserId, currentTeamId, {page}));
    }, [currentUserId, currentTeamId, page, filter]);

    useEffect(() => {
        dispatch(selectChannel(''));
        dispatch(setSelectedThreadId(currentUserId, currentTeamId, threadIdentifier));
    }, [currentUserId, currentTeamId, threadIdentifier]);

    return (
        <div
            id='app-content'
            className={classNames('GlobalThreads app__content', {'thread-selected': Boolean(selectedThread)})}
        >
            <Header
                level={2}
                className={'GlobalThreads___header'}
                heading={formatMessage({id: 'globalThreads.heading', defaultMessage: 'Followed threads'})}
                subtitle={formatMessage({id: 'globalThreads.subtitle', defaultMessage: 'Threads you’re participating in will automatically show here'})}
                right={<RHSNavigation/>}
            />
            {isEmpty(threadIds) ? (
                <div className='no-results__holder'>
                    {counts?.total == null ? (
                        <LoadingScreen/>
                    ) : (
                        <div className='no-results__holder'>
                            <NoResultsIndicator
                                iconGraphic={ChatIllustrationImg}
                                title={'No followed threads yet'}
                                subtitle={'Any threads you are mentioned in or have participated in will show here along with any threads you have followed.'}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <ThreadList
                        currentFilter={filter}
                        setFilter={setFilter}
                        someUnread={Boolean(numUnread)}
                    >
                        {(filter === 'unread' ? unreadThreadIds : threadIds).map((id) => (
                            <ThreadItem
                                key={id}
                                threadId={id}
                                isSelected={threadIdentifier === id}
                            />
                        ))}
                        {filter === 'unread' && !numUnread && (
                            <div className='no-results__holder'>
                                <NoResultsIndicator
                                    iconGraphic={BalloonIllustrationImg}
                                    title={'No unread threads'}
                                />
                            </div>
                        )}
                    </ThreadList>
                    {selectedThread ? (
                        <ThreadPane
                            thread={selectedThread}
                            isFollowing={selectedThread.is_following ?? false}
                            isSaved={false}
                            hasUnreads={!isEmpty(unreadThreadIds)}
                        >
                            <ThreadViewer
                                currentUserId={currentUserId}
                                rootPostId={selectedThread.id}
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
                                    link: (chunks) => (
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
