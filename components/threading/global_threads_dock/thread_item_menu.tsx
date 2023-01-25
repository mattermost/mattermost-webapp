// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback, ReactNode} from 'react';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector, shallowEqual} from 'react-redux';

import {Preferences} from 'mattermost-redux/constants';
import {get} from 'mattermost-redux/selectors/entities/preferences';

import {setThreadFollow, updateThreadRead, markLastPostInThreadAsUnread} from 'mattermost-redux/actions/threads';
import {manuallyMarkThreadAsUnread} from 'actions/views/threads';

import {
    flagPost as savePost,
    unflagPost as unsavePost,
} from 'actions/post_actions';

import {getSiteURL} from 'utils/url';
import {t} from 'utils/i18n';
import {copyToClipboard} from 'utils/utils';

import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import {GlobalState} from 'types/store';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeam, getTeam} from 'mattermost-redux/selectors/entities/teams';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {Post} from '@mattermost/types/posts';

import {selectPost} from 'actions/views/rhs';

import {openDocked} from './dock';

type Props = {
    threadId: string;
    post: Post | undefined;
    isFollowing?: boolean;
    hasUnreads: boolean;
    children: ReactNode;
    unreadTimestamp: number;
};

function ThreadMenu({
    threadId,
    post,
    isFollowing = false,
    unreadTimestamp,
    hasUnreads,
    children,
}: Props) {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();
    const currentUserId = useSelector(getCurrentUserId);
    const channel = useSelector((state: GlobalState) => post && getChannel(state, post.channel_id));
    const team = useSelector((state: GlobalState) => (channel && getTeam(state, channel?.team_id)) ?? getCurrentTeam(state));
    const teamId = team?.id;
    const teamName = team?.name;
    const isSaved = useSelector((state: GlobalState) => get(state, Preferences.CATEGORY_FLAGGED_POST, threadId, null) != null, shallowEqual);

    const handleReadUnread = useCallback(() => {
        const lastViewedAt = hasUnreads ? Date.now() : unreadTimestamp;

        dispatch(manuallyMarkThreadAsUnread(threadId, lastViewedAt));
        if (hasUnreads) {
            dispatch(updateThreadRead(currentUserId, teamId, threadId, Date.now()));
        } else {
            dispatch(markLastPostInThreadAsUnread(currentUserId, teamId, threadId));
        }
    }, [
        currentUserId,
        teamId,
        threadId,
        hasUnreads,
        updateThreadRead,
        unreadTimestamp,
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
                        text: (post?.reply_count ?? 0) >= 1 ? formatMessage({
                            id: t('threading.threadMenu.unfollow'),
                            defaultMessage: 'Unfollow thread',
                        }) : formatMessage({
                            id: t('threading.threadMenu.unfollowMessage'),
                            defaultMessage: 'Unfollow message',
                        }),
                        extraText: formatMessage({
                            id: t('threading.threadMenu.unfollowExtra'),
                            defaultMessage: 'You won’t be notified about replies',
                        }),
                    } : {
                        text: (post?.reply_count ?? 0) >= 1 ? formatMessage({
                            id: t('threading.threadMenu.follow'),
                            defaultMessage: 'Follow thread',
                        }) : formatMessage({
                            id: t('threading.threadMenu.followMessage'),
                            defaultMessage: 'Follow message',
                        }),
                        extraText: formatMessage({
                            id: t('threading.threadMenu.followExtra'),
                            defaultMessage: 'You will be notified about replies',
                        }),
                    }}
                    onClick={useCallback(() => {
                        dispatch(setThreadFollow(currentUserId, teamId, threadId, !isFollowing));
                    }, [currentUserId, teamId, threadId, isFollowing, setThreadFollow])}
                />
                <Menu.ItemAction
                    text={formatMessage({
                        id: t('threading.threadMenu.openInSidebar'),
                        defaultMessage: 'Open in sidebar',
                    })}
                    onClick={useCallback(() => {
                        if (post) {
                            dispatch(selectPost(post));
                        }
                    }, [post])}
                />
                <Menu.ItemAction
                    show={isFollowing}
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
                        copyToClipboard(`${getSiteURL()}/${teamName}/pl/${threadId}`);
                    }, [teamName, threadId])}
                />
            </Menu>
        </MenuWrapper>
    );
}

function areEqual(prevProps: Props, nextProps: Props) {
    return (
        prevProps.post?.id === nextProps.post?.id &&
        prevProps.post?.channel_id === nextProps.post?.channel_id &&
        prevProps.isFollowing === nextProps.isFollowing &&
        prevProps.unreadTimestamp === nextProps.unreadTimestamp &&
        prevProps.hasUnreads === nextProps.hasUnreads
    );
}

export default memo(ThreadMenu, areEqual);
