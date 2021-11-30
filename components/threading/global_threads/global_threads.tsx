// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback, useEffect, useState} from 'react';
import {useIntl} from 'react-intl';
import {isEmpty} from 'lodash';
import {Link, useRouteMatch} from 'react-router-dom';
import {useSelector, useDispatch, shallowEqual} from 'react-redux';
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
import {clearLastUnreadChannel} from 'actions/global_actions';
import {setSelectedThreadId} from 'actions/views/threads';
import {suppressRHS, unsuppressRHS} from 'actions/views/rhs';
import {loadProfilesForSidebar} from 'actions/user_actions';
import {getSelectedThreadIdInCurrentTeam} from 'selectors/views/threads';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {showNextSteps} from 'components/next_steps_view/steps';

import Header from 'components/widgets/header';
import LoadingScreen from 'components/loading_screen';
import NoResultsIndicator from 'components/no_results_indicator';
import NextStepsView from 'components/next_steps_view';

import {useThreadRouting} from '../hooks';
import ChatIllustration from '../common/chat_illustration';

import ThreadViewer from '../thread_viewer';

import ThreadList, {ThreadFilter, FILTER_STORAGE_KEY} from './thread_list';
import ThreadPane from './thread_pane';

import './global_threads.scss';

const GlobalThreads = () => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();

    const {url, params: {threadIdentifier}} = useRouteMatch<{threadIdentifier?: string}>();
    const [filter, setFilter] = useGlobalState(ThreadFilter.none, FILTER_STORAGE_KEY);
    const {currentTeamId, currentUserId, clear} = useThreadRouting();

    const counts = useSelector(getThreadCountsInCurrentTeam);
    const selectedThread = useSelector((state: GlobalState) => getThread(state, threadIdentifier));
    const selectedThreadId = useSelector(getSelectedThreadIdInCurrentTeam);
    const selectedPost = useSelector((state: GlobalState) => getPost(state, threadIdentifier!));
    const showNextStepsEphemeral = useSelector((state: GlobalState) => state.views.nextSteps.show);
    const showSteps = useSelector((state: GlobalState) => showNextSteps(state));
    const config = useSelector(getConfig);
    const threadIds = useSelector((state: GlobalState) => getThreadOrderInCurrentTeam(state, selectedThread?.id), shallowEqual);
    const unreadThreadIds = useSelector((state: GlobalState) => getUnreadThreadOrderInCurrentTeam(state, selectedThread?.id), shallowEqual);
    const numUnread = counts?.total_unread_threads || 0;

    useEffect(() => {
        dispatch(suppressRHS);
        dispatch(selectChannel(''));
        dispatch(clearLastUnreadChannel);
        loadProfilesForSidebar();

        // unsuppresses RHS on navigating away (unmount)
        return () => {
            dispatch(unsuppressRHS);
        };
    }, []);

    useEffect(() => {
        if (!selectedThreadId || selectedThreadId !== threadIdentifier) {
            dispatch(setSelectedThreadId(currentTeamId, selectedThread?.id));
        }
    }, [currentTeamId, selectedThreadId, threadIdentifier]);

    const isEmptyList = isEmpty(threadIds) && isEmpty(unreadThreadIds);

    const [isLoading, setLoading] = useState(isEmptyList);

    const fetchThreads = useCallback(async (unread): Promise<{data: any}> => {
        await dispatch(getThreads(
            currentUserId,
            currentTeamId,
            {
                unread,
                perPage: 25,
            },
        ));

        return {data: true};
    }, [currentUserId, currentTeamId]);

    const isOnlySelectedThreadInList = (list: string[]) => {
        return selectedThreadId && list.length === 1 && list.includes(selectedThreadId);
    };

    useEffect(() => {
        const promises = [];

        // this is needed to jump start threads fetching
        if (isEmpty(threadIds) || isOnlySelectedThreadInList(threadIds)) {
            promises.push(fetchThreads(false));
        }

        if (filter === ThreadFilter.unread && (isEmpty(unreadThreadIds) || isOnlySelectedThreadInList(unreadThreadIds))) {
            promises.push(fetchThreads(true));
        }

        Promise.all(promises).then(() => {
            setLoading(false);
        });
    }, [fetchThreads, filter, threadIds, unreadThreadIds]);

    useEffect(() => {
        if (!selectedThread && !selectedPost && !isLoading) {
            clear();
        }
    }, [currentTeamId, selectedThread, selectedPost, isLoading, counts, filter]);

    // cleanup on unmount
    useEffect(() => {
        return () => {
            dispatch(setSelectedThreadId(currentTeamId, ''));
        };
    }, []);

    const handleSelectUnread = useCallback(() => {
        setFilter(ThreadFilter.unread);
    }, []);

    const enableOnboardingFlow = config.EnableOnboardingFlow === 'true';
    if (showNextStepsEphemeral && enableOnboardingFlow && showSteps) {
        return <NextStepsView/>;
    }

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
            />

            {isLoading || isEmptyList ? (
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
                        selectedThreadId={threadIdentifier}
                        ids={threadIds}
                        unreadIds={unreadThreadIds}
                    />
                    {selectedThread && selectedPost ? (
                        <ThreadPane
                            thread={selectedThread}
                        >
                            <ThreadViewer
                                rootPostId={selectedThread.id}
                                useRelativeTimestamp={true}
                                isThreadView={true}
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
                                defaultMessage: 'You have {numUnread, plural, =0 {no unread threads} =1 {<link>{numUnread} thread</link>} other {<link>{numUnread} threads</link>}} {numUnread, plural, =0 {} other {with unread messages}}',
                            }, {
                                numUnread,
                                link: (chunks) => (
                                    <Link
                                        key='single'
                                        to={`${url}/${unreadThreadIds[0]}`}
                                        onClick={handleSelectUnread}
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
