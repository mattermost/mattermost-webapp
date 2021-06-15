// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback, ReactNode} from 'react';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {Preferences} from 'mattermost-redux/constants';
import {$ID} from 'mattermost-redux/types/utilities';
import {UserThread} from 'mattermost-redux/types/threads';
import {get} from 'mattermost-redux/selectors/entities/preferences';

import {setThreadFollow, updateThreadRead} from 'mattermost-redux/actions/threads';
import {updateThreadLastOpened} from 'actions/views/threads';

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

import {useThreadRouting} from '../../hooks';

import './thread_menu.scss';

type Props = {
    threadId: $ID<UserThread>;
    isFollowing?: boolean;
    hasUnreads: boolean;
    children: ReactNode;
    unreadTimestamp: number;
};

function ThreadMenu({
    threadId,
    isFollowing = false,
    unreadTimestamp,
    hasUnreads,
    children,
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

    const isSaved = useSelector((state: GlobalState) => get(state, Preferences.CATEGORY_FLAGGED_POST, threadId, null) != null);

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
                    onClick={useCallback(() => {
                        dispatch(updateThreadLastOpened(threadId, hasUnreads ? Date.now() : unreadTimestamp));
                        dispatch(updateThreadRead(currentUserId, currentTeamId, threadId, hasUnreads ? Date.now() : unreadTimestamp));
                    }, [currentUserId, currentTeamId, threadId, hasUnreads, updateThreadRead, unreadTimestamp])}
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

export default memo(ThreadMenu);
