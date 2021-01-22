// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useEffect} from 'react';
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
import {loadProfilesForSidebar} from 'actions/user_actions';

import RHSSearchNav from 'components/rhs_search_nav';
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
    const {currentTeamId, currentUserId, clear} = useThreadRouting();

    const counts = useSelector(getThreadCountsInCurrentTeam);
    const selectedThread = useSelector((state: GlobalState) => getThread(state, threadIdentifier));

    const threadIds = useSelector(getThreadOrderInCurrentTeam);
    const unreadThreadIds = useSelector(getUnreadThreadOrderInCurrentTeam);
    const numUnread = counts?.total_unread_threads || 0;
    const isLoading = counts?.total == null || (counts.total && isEmpty(threadIds));

    useEffect(() => {
        dispatch(selectChannel(''));
        loadProfilesForSidebar();
    }, []);
    useEffect(() => {
        dispatch(getThreads(currentUserId, currentTeamId, {unread: filter === 'unread', perPage: 2}));
    }, [currentUserId, currentTeamId, filter]);

    useEffect(() => {
        dispatch(setSelectedThreadId(currentUserId, currentTeamId, selectedThread?.id));
        if (!selectedThread && !isLoading) {
            clear();
        }
    }, [currentUserId, currentTeamId, threadIdentifier, counts]);

    return (
        <div
            id='app-content'
            className={classNames('GlobalThreads app__content', {'thread-selected': Boolean(selectedThread)})}
        >
            <Header
                level={2}
                className={'GlobalThreads___header'}
                heading={formatMessage({
                    id: 'globalThreads.heading',
                    defaultMessage: 'Followed threads',
                })}
                subtitle={formatMessage({
                    id: 'globalThreads.subtitle',
                    defaultMessage: 'Threads you’re participating in will automatically show here',
                })}
                right={<RHSSearchNav/>}
            />
            {isEmpty(threadIds) ? (
                <div className='no-results__holder'>
                    {isLoading ? (
                        <LoadingScreen/>
                    ) : (
                        <NoResultsIndicator
                            expanded={true}
                            iconGraphic={ChatIllustrationImg}
                            title={formatMessage({
                                id: 'globalThreads.noThreads.title',
                                defaultMessage: 'No followed threads yet',
                            })}
                            subtitle={formatMessage({
                                id: 'globalThreads.noThreads.subtitle',
                                defaultMessage: 'Any threads you are mentioned in or have participated in will show here along with any threads you have followed.',
                            })}
                        />
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
                        {filter === 'unread' && !numUnread ? (
                            <NoResultsIndicator
                                expanded={true}
                                iconGraphic={BalloonIllustrationImg}
                                title={formatMessage({
                                    id: 'globalThreads.threadList.noUnreadThreads',
                                    defaultMessage: 'No unread threads',
                                })}
                            />
                        ) : null}
                    </ThreadList>
                    {selectedThread ? (
                        <ThreadPane
                            thread={selectedThread}
                            isFollowing={selectedThread.is_following ?? false}
                            hasUnreads={!isEmpty(unreadThreadIds)}
                        >
                            <ThreadViewer
                                currentUserId={currentUserId}
                                rootPostId={selectedThread.id}
                                useRelativeTimestamp={true}
                            />
                        </ThreadPane>
                    ) : (
                        <NoResultsIndicator
                            expanded={true}
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
                    )}
                </>
            )}
        </div>
    );
};

export default memo(GlobalThreads);
