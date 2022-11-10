// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';

import {ClockOutlineIcon} from '@mattermost/compass-icons/components';

import {useSelector, useDispatch} from 'react-redux';

import {useGlobalState} from 'stores/hooks';

import {getPost} from 'mattermost-redux/selectors/entities/posts';

import {getPostsByIds} from 'mattermost-redux/actions/posts';

import {GlobalState} from 'types/store';

import {getMissingProfilesByIds} from 'mattermost-redux/actions/users';

import ThreadItem from './thread_item';
import {BarItem} from './bar_item';

const DOCKED_THREADS = 'docked_threads';

export const useDockedThreads = () => {
    const [threadIds, setThreadIds] = useGlobalState<string[]>([], DOCKED_THREADS);

    const open = (id: string) => {
        setThreadIds([...threadIds.filter((threadId) => threadId !== id), id]);
    };

    const close = (id: string) => {
        setThreadIds(threadIds.filter((threadId) => threadId !== id));
    };

    return {
        threadIds,
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
            <BarItem>
                {'Threads'}
            </BarItem>
            <ThreadHistory/>
        </footer>
    );
};

const HistoryButton = () => {
    return (
        <BarItem>
            <ClockOutlineIcon size={18}/>
        </BarItem>
    );
};

const ThreadHistory = () => {
    return (
        <HistoryButton/>
    );
};

export default DockDock;
