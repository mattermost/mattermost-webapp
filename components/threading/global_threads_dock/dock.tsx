// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';

import {useSelector, useDispatch} from 'react-redux';

import {currentUserAndTeamSuffix, useGlobalState} from 'stores/hooks';

import {getPost} from 'mattermost-redux/selectors/entities/posts';

import {getPostsByIds} from 'mattermost-redux/actions/posts';

import {GlobalState} from 'types/store';

import {getMissingProfilesByIds} from 'mattermost-redux/actions/users';

import {DispatchFunc} from 'mattermost-redux/types/actions';

import {getGlobalItem} from 'selectors/storage';
import {setGlobalItem} from 'actions/storage';

import {Post} from '@mattermost/types/posts';

import {getIsMobileView} from 'selectors/views/browser';

import ThreadItem from './thread_item';

const DOCKED_THREADS = 'docked_threads';
const DOCKED_THREADS_OPEN = 'docked_threads_open';

export const useDockedThreads = (threadId?: string) => {
    const [threadIds, setThreadIds] = useGlobalState<string[]>([], DOCKED_THREADS, currentUserAndTeamSuffix);
    const [threadsOpenState, setThreadsOpenStateInner] = useGlobalState<Record<string, number>>({}, DOCKED_THREADS_OPEN, currentUserAndTeamSuffix);

    const setIsOpen = (id: string, num?: number) => {
        if (typeof num === 'number') {
            setThreadsOpenStateInner((state) => ({...state, [id]: num}));
        } else {
            setThreadsOpenStateInner((state) => {
                // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
                const {[id]: _, ...rest} = state;
                return {...rest};
            });
        }
    };

    const open = (id: string) => {
        setIsOpen(id, 1);
        if (threadIds.includes(id)) {
            return;
        }
        setThreadIds((state) => [...state.filter((threadId) => threadId !== id), id]);
    };

    const minimize = (id: string) => {
        setIsOpen(id, 0);
    };

    const expand = (id: string, num = isExpanded ? 1 : 2) => {
        setIsOpen(id, num);
    };

    const close = (id: string) => {
        setThreadIds((state) => state.filter((threadId) => threadId !== id));
        setIsOpen(id, 0);
    };

    const isOpen = threadId && threadsOpenState[threadId] >= 1;
    const isExpanded = threadId && threadsOpenState[threadId] === 2;

    return {
        threadIds,
        isOpen,
        isExpanded,
        minimize,
        expand,
        open,
        close,
    };
};

export const openDocked = (post: Post) => {
    const id = post?.root_id || post?.id;
    return (dispatch: DispatchFunc, getState: () => GlobalState) => {
        const state = getState();
        const suffix = currentUserAndTeamSuffix(state);
        const threadIds = getGlobalItem(state, DOCKED_THREADS + suffix, []);
        const threadsOpenState = getGlobalItem(state, DOCKED_THREADS_OPEN + suffix, {});
        console.log('openDocked', id, threadIds, threadsOpenState);

        if (!threadIds.includes(id)) {
            dispatch(setGlobalItem(DOCKED_THREADS + suffix, [...threadIds, id]));
        }

        dispatch(setGlobalItem(DOCKED_THREADS_OPEN + suffix, {...threadsOpenState, [id]: 1}));
    };
};

const useEnsureDeps = (postIds: string[]) => {
    const dispatch = useDispatch();
    const missingPostIds = useSelector((state: GlobalState) => postIds?.filter((postId) => !getPost(state, postId)));
    useEffect(() => {
        dispatch(getPostsByIds(missingPostIds));
    }, [postIds]);

    const postAuthorIds = useSelector((state: GlobalState) => postIds.reduce<string[]>((postAuthorIds, postId) => {
        const post = getPost(state, postId);
        if (post) {
            postAuthorIds.push(post.user_id);
        }
        return postAuthorIds;
    }, []));

    useEffect(() => {
        if (postAuthorIds.length) {
            dispatch(getMissingProfilesByIds(postAuthorIds));
        }
    }, [postAuthorIds]);
};

const DockDock = () => {
    const {threadIds} = useDockedThreads();
    useEnsureDeps(threadIds);
    const isMobileView = useSelector(getIsMobileView);

    if (isMobileView || !threadIds.length) {
        return null;
    }

    return (
        <footer
            css={`
                grid-area: footer;
                display: flex;
                height: 40px;
                padding: 6px;
                gap: 8px;
                background: var(--global-header-background);
                z-index: 103;
            `}
        >
            <div
                css={`
                    display: flex;
                    justify-content: end;
                    width: 100%;
                    gap: 8px;
                `}
            >
                {threadIds.map((id) => {
                    return (
                        <ThreadItem
                            key={id}
                            id={id}
                        />
                    );
                })}
            </div>
            {/* <BarItem>
                <ClockOutlineIcon size={18}/>
                {'Recent'}
            </BarItem> */}
        </footer>
    );
};

export default DockDock;
