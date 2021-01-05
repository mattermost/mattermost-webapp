// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback, ReactNode} from 'react';
import {useIntl} from 'react-intl';

import {$ID} from 'mattermost-redux/types/utilities';
import {UserThread} from 'mattermost-redux/types/threads';

import {t} from 'utils/i18n';

import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import {useThreadRouting} from '../../hooks';

type Props = {
    threadId: $ID<UserThread>;
    isFollowing: boolean;
    isSaved: boolean;
    hasUnreads: boolean;
    children: ReactNode;
};

function ThreadMenu({
    threadId,
    isFollowing,
    isSaved,
    hasUnreads,
    children,
}: Props) {
    const {formatMessage} = useIntl();
    const {goToInChannel} = useThreadRouting();

    return (
        <MenuWrapper
            stopPropagationOnToggle={true}
        >
            {children}

            <Menu
                ariaLabel={''}
                openLeft={true}
            >
                {isFollowing ? (
                    <Menu.ItemAction
                        text={formatMessage({
                            id: t('threading.threadMenu.unfollow'),
                            defaultMessage: 'Unfollow thread',
                        })}
                        extraText={formatMessage({
                            id: t('threading.threadMenu.unfollowExtra'),
                            defaultMessage: 'You won’t be notified about replies',
                        })}

                        //onClick={unFollow}
                    />
                ) : (
                    <Menu.ItemAction

                        //onClick={follow}
                        text={formatMessage({
                            id: t('threading.threadMenu.follow'),
                            defaultMessage: 'Follow thread',
                        })}
                        extraText={formatMessage({
                            id: t('threading.threadMenu.followExtra'),
                            defaultMessage: 'You will be notified about replies',
                        })}
                    />
                )}
                <Menu.ItemAction
                    onClick={useCallback(() => {
                        goToInChannel(threadId);
                    }, [threadId])}
                    text={formatMessage({
                        id: t('threading.threadMenu.openInChannel'),
                        defaultMessage: 'Open in channel',
                    })}
                />
                {hasUnreads ? (
                    <Menu.ItemAction

                        //onClick={markRead}
                        text={formatMessage({
                            id: t('threading.threadMenu.markRead'),
                            defaultMessage: 'Mark as read',
                        })}
                    />
                ) : (
                    <Menu.ItemAction

                        //onClick={markUnread}
                        text={formatMessage({
                            id: t('threading.threadMenu.markUnread'),
                            defaultMessage: 'Mark as unread',
                        })}
                    />
                )}
                {isSaved ? (
                    <Menu.ItemAction

                        //onClick={unSave}
                        text={formatMessage({
                            id: t('threading.threadMenu.unsave'),
                            defaultMessage: 'Unsave',
                        })}
                    />
                ) : (
                    <Menu.ItemAction

                        //onClick={save}
                        text={formatMessage({
                            id: t('threading.threadMenu.save'),
                            defaultMessage: 'Save',
                        })}
                    />
                )}
                <Menu.ItemAction

                    //onClick={copyLink}
                    text={formatMessage({
                        id: t('threading.threadMenu.copy'),
                        defaultMessage: 'Copy link',
                    })}
                />
            </Menu>
        </MenuWrapper>
    );
}

export default memo(ThreadMenu);
