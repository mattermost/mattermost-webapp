// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback, ReactNode} from 'react';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector, shallowEqual} from 'react-redux';

import {Preferences} from 'mattermost-redux/constants';
import {UserThread} from '@mattermost/types/threads';
import {Post} from '@mattermost/types/posts';
import {get} from 'mattermost-redux/selectors/entities/preferences';

import {setThreadFollow, updateThreadRead, markThreadAsUnread} from 'mattermost-redux/actions/threads';
import {manuallyMarkThreadAsUnread} from 'actions/views/threads';

import {
    flagPost as savePost,
    unflagPost as unsavePost,
} from 'actions/post_actions';

import {getSiteURL} from 'utils/url';
import {t} from 'utils/i18n';
import {copyToClipboard} from 'utils/utils';

import {ActionResult} from 'mattermost-redux/types/actions';

import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import {GlobalState} from 'types/store';

import {useThreadRouting} from '../../hooks';

import './thread_menu.scss';

export type Props = {
    threadId: UserThread['id'];
    postsInThread: Post[];
    isFollowing?: boolean;
    hasUnreads: boolean;
    children: ReactNode;
    unreadTimestamp: number;
    actions: {
        getPostThread: (rootId: string) => Promise<ActionResult>;
    };
};

function ThreadMenu({
    threadId,
    postsInThread,
    isFollowing = false,
    unreadTimestamp,
    hasUnreads,
    children,
    actions,
}: Props) {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();
    const {
        params: {
            team,
        },
        currentTeamId,
        currentUserId,
        goToInChannel,
    } = useThreadRouting();

    React.useEffect(() => {
        actions.getPostThread(threadId);
    }, [threadId, actions]);

    const isSaved = useSelector((state: GlobalState) => get(state, Preferences.CATEGORY_FLAGGED_POST, threadId, null) != null, shallowEqual);

    const handleReadUnread = useCallback(() => {
        const lastViewedAt = hasUnreads ? Date.now() : unreadTimestamp;

        dispatch(manuallyMarkThreadAsUnread(threadId, lastViewedAt));
        if (hasUnreads) {
            dispatch(updateThreadRead(currentUserId, currentTeamId, threadId, Date.now()));
        } else {
            const lastPostId = postsInThread.length > 1 ? postsInThread[0].id : threadId;
            dispatch(markThreadAsUnread(currentUserId, currentTeamId, threadId, lastPostId));
        }
    }, [
        currentUserId,
        currentTeamId,
        threadId,
        actions,
        hasUnreads,
        updateThreadRead,
        unreadTimestamp,
        postsInThread,
    ]);

    return (
        <MenuWrapper
            stopPropagationOnToggle={true}
        >
            {children}
            <Menu
                ariaLabel={''}
                openLeft={true}
            >
                <Menu.ItemAction
                    {...isFollowing ? {
                        text: formatMessage({
                            id: t('threading.threadMenu.unfollow'),
                            defaultMessage: 'Unfollow thread',
                        }),
                        extraText: formatMessage({
                            id: t('threading.threadMenu.unfollowExtra'),
                            defaultMessage: 'You won’t be notified about replies',
                        }),
                    } : {
                        text: formatMessage({
                            id: t('threading.threadMenu.follow'),
                            defaultMessage: 'Follow thread',
                        }),
                        extraText: formatMessage({
                            id: t('threading.threadMenu.followExtra'),
                            defaultMessage: 'You will be notified about replies',
                        }),
                    }}
                    onClick={useCallback(() => {
                        dispatch(setThreadFollow(currentUserId, currentTeamId, threadId, !isFollowing));
                    }, [currentUserId, currentTeamId, threadId, isFollowing, setThreadFollow])}
                />
                <Menu.ItemAction
                    text={formatMessage({
                        id: t('threading.threadMenu.openInChannel'),
                        defaultMessage: 'Open in channel',
                    })}
                    onClick={useCallback(() => {
                        goToInChannel(threadId);
                    }, [threadId])}
                />
                <Menu.ItemAction
                    text={formatMessage(hasUnreads ? {
                        id: t('threading.threadMenu.markRead'),
                        defaultMessage: 'Mark as read',
                    } : {
                        id: t('threading.threadMenu.markUnread'),
                        defaultMessage: 'Mark as unread',
                    })}
                    onClick={handleReadUnread}
                />

                <Menu.ItemAction
                    text={formatMessage(isSaved ? {
                        id: t('threading.threadMenu.unsave'),
                        defaultMessage: 'Unsave',
                    } : {
                        id: t('threading.threadMenu.save'),
                        defaultMessage: 'Save',
                    })}
                    onClick={useCallback(() => {
                        dispatch(isSaved ? unsavePost(threadId) : savePost(threadId));
                    }, [threadId, isSaved])}
                />
                <Menu.ItemAction
                    text={formatMessage({
                        id: t('threading.threadMenu.copy'),
                        defaultMessage: 'Copy link',
                    })}
                    onClick={useCallback(() => {
                        copyToClipboard(`${getSiteURL()}/${team}/pl/${threadId}`);
                    }, [team, threadId])}
                />
            </Menu>
        </MenuWrapper>
    );
}

function areEqual(prevProps: Props, nextProps: Props) {
    return (
        prevProps.threadId === nextProps.threadId &&
        prevProps.isFollowing === nextProps.isFollowing &&
        prevProps.unreadTimestamp === nextProps.unreadTimestamp &&
        prevProps.hasUnreads === nextProps.hasUnreads &&
        prevProps.postsInThread === nextProps.postsInThread &&
        prevProps.actions === nextProps.actions
    );
}

export default memo(ThreadMenu, areEqual);
