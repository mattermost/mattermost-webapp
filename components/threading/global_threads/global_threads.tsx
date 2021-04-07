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

import {getPost} from 'mattermost-redux/selectors/entities/posts';

import {GlobalState} from 'types/store/index';

import {useGlobalState} from 'stores/hooks';
import {setSelectedThreadId} from 'actions/views/threads';
import {loadProfilesForSidebar} from 'actions/user_actions';

import RHSSearchNav from 'components/rhs_search_nav';
import Header from 'components/widgets/header';
import LoadingScreen from 'components/loading_screen';
import NoResultsIndicator from 'components/no_results_indicator';

import {useThreadRouting} from '../hooks';
import ChatIllustration from '../common/chat_illustration';
import BalloonIllustration from '../common/balloon_illustration';

import ThreadViewer from '../thread_viewer';

import ThreadList, {ThreadFilter, FILTER_STORAGE_KEY} from './thread_list';
import ThreadPane from './thread_pane';
import ThreadItem from './thread_item';

import './global_threads.scss';

const GlobalThreads = () => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();

    const {url, params: {threadIdentifier}} = useRouteMatch<{threadIdentifier?: string}>();
    const [filter, setFilter] = useGlobalState(ThreadFilter.none, FILTER_STORAGE_KEY);
    const {currentTeamId, currentUserId, clear} = useThreadRouting();

    const counts = useSelector(getThreadCountsInCurrentTeam);
    const selectedThread = useSelector((state: GlobalState) => getThread(state, threadIdentifier));
    const selectedPost = useSelector((state: GlobalState) => getPost(state, threadIdentifier!));
    const threadIds = useSelector((state: GlobalState) => getThreadOrderInCurrentTeam(state, selectedThread?.id));
    const unreadThreadIds = useSelector((state: GlobalState) => getUnreadThreadOrderInCurrentTeam(state, selectedThread?.id));
    const numUnread = counts?.total_unread_threads || 0;
    const isLoading = counts?.total == null;

    useEffect(() => {
        dispatch(selectChannel(''));
        loadProfilesForSidebar();
    }, []);
    useEffect(() => {
        dispatch(getThreads(currentUserId, currentTeamId, {unread: filter === 'unread', perPage: 200}));
    }, [currentUserId, currentTeamId, filter]);

    useEffect(() => {
        dispatch(setSelectedThreadId(currentTeamId, selectedThread?.id));
        if ((!selectedThread || !selectedPost) && !isLoading) {
            clear();
        }
    }, [currentTeamId, selectedThread, selectedPost, isLoading, counts, filter]);

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
                            iconGraphic={ChatIllustration}
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
                        {filter === 'unread' && !numUnread && isEmpty(unreadThreadIds) ? (
                            <NoResultsIndicator
                                expanded={true}
                                iconGraphic={BalloonIllustration}
                                title={formatMessage({
                                    id: 'globalThreads.threadList.noUnreadThreads',
                                    defaultMessage: 'No unread threads',
                                })}
                            />
                        ) : null}
                    </ThreadList>
                    {selectedThread && selectedPost ? (
                        <ThreadPane
                            thread={selectedThread}
                        >
                            <ThreadViewer
                                rootPostId={selectedThread.id}
                                useRelativeTimestamp={true}
                            />
                        </ThreadPane>
                    ) : (
                        <NoResultsIndicator
                            expanded={true}
                            iconGraphic={ChatIllustration}
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
