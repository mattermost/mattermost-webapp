// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';

import {useSelector, useDispatch} from 'react-redux';

import {useGlobalState} from 'stores/hooks';

import {getPost} from 'mattermost-redux/selectors/entities/posts';

import {getPostsByIds} from 'mattermost-redux/actions/posts';

import {GlobalState} from 'types/store';

import {getMissingProfilesByIds} from 'mattermost-redux/actions/users';

import ThreadItem from './thread_item';

const DOCKED_THREADS = 'docked_threads';
const DOCKED_THREADS_OPEN = 'docked_threads_open';

export const useDockedThreads = (threadId?: string) => {
    const [threadIds, setThreadIds] = useGlobalState<string[]>([], DOCKED_THREADS);
    const [openThreadIds, setOpenThreadIdsInner] = useGlobalState<Record<string, number>>({}, DOCKED_THREADS_OPEN);

    const setIsOpen = (id: string, num?: number) => {
        if (typeof num === 'number') {
            setOpenThreadIdsInner((state) => ({...state, [id]: num}));
        } else {
            setOpenThreadIdsInner((state) => {
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
        setThreadIds([...threadIds.filter((threadId) => threadId !== id), id]);
    };

    const minimize = (id: string) => {
        setIsOpen(id, 0);
    };

    const expand = (id: string, num = isExpanded ? 1 : 2) => {
        setIsOpen(id, num);
    };

    const close = (id: string) => {
        setThreadIds(threadIds.filter((threadId) => threadId !== id));
        setIsOpen(id, 0);
    };

    const isOpen = threadId && openThreadIds[threadId] >= 1;
    const isExpanded = threadId && openThreadIds[threadId] === 2;

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

    if (!threadIds.length) {
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
