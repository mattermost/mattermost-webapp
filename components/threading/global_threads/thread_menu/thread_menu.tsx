// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {FC, memo} from 'react';
import {useIntl} from 'react-intl';

import {t} from 'utils/i18n';

import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import Button from 'components/threading/common/button';
import SimpleTooltip from 'components/simple_tooltip';

type Props = {
    isFollowing: boolean,
    isSaved: boolean,
    hasUnreads: boolean,
    actions: {
        follow: () => void,
        unfollow: () => void,
        save: () => void,
        unsave: () => void,
        markRead: () => void,
        markUnread: () => void,
        openInChannel: () => void,
        copyLink: () => void,
    }
};

const Comp: FC<Props> = ({
    isFollowing,
    isSaved,
    hasUnreads,
    actions: {
        follow,
        unfollow,
        save,
        unsave,
        markRead,
        markUnread,
        openInChannel,
        copyLink,
    },
    children = (
        <Button>
            <i className='Icon icon-dots-vertical'/>
        </Button>
    ),
}) => {
    const {formatMessage} = useIntl();

    return (
        <MenuWrapper
            stopPropagationOnToggle={true}
        >
            <SimpleTooltip
                id='threadActionMenu'
                content={formatMessage({
                    id: 'threading.threadItem.menu',
                    defaultMessage: 'Actions',
                })}
            >
                {children}
            </SimpleTooltip>

            <Menu
                ariaLabel={''}
                openLeft={true}
            >
                {isFollowing ? (
                    <Menu.ItemAction
                        text={formatMessage({
                            id: t('threading.threadItem.unfollow'),
                            defaultMessage: 'Unfollow thread',
                        })}
                        extraText={formatMessage({
                            id: t('threading.menuItem.unfollowExtra'),
                            defaultMessage: 'You won’t be notified about replies',
                        })}
                        onClick={unfollow}
                    />
                ) : (
                    <Menu.ItemAction
                        onClick={follow}
                        text={formatMessage({
                            id: t('threading.threadItem.follow'),
                            defaultMessage: 'Keep following thread',
                        })}
                    />
                )}
                <Menu.ItemAction
                    onClick={openInChannel}
                    text={formatMessage({
                        id: t('threading.threadItem.openInChannel'),
                        defaultMessage: 'Open in channel',
                    })}
                />
                {hasUnreads ? (
                    <Menu.ItemAction
                        onClick={markRead}
                        text={formatMessage({
                            id: t('threading.threadItem.markRead'),
                            defaultMessage: 'Mark as read',
                        })}
                    />
                ) : (
                    <Menu.ItemAction
                        onClick={markUnread}
                        text={formatMessage({
                            id: t('threading.threadItem.markUnread'),
                            defaultMessage: 'Mark as unread',
                        })}
                    />
                )}
                {isSaved ? (
                    <Menu.ItemAction
                        onClick={unsave}
                        text={formatMessage({
                            id: t('threading.threadItem.unsave'),
                            defaultMessage: 'Unsave',
                        })}
                    />
                ) : (
                    <Menu.ItemAction
                        onClick={save}
                        text={formatMessage({
                            id: t('threading.threadItem.save'),
                            defaultMessage: 'Save',
                        })}
                    />
                )}
                <Menu.ItemAction
                    onClick={copyLink}
                    text={formatMessage({
                        id: t('threading.threadItem.copy'),
                        defaultMessage: 'Copy link',
                    })}
                />
            </Menu>
        </MenuWrapper>
    );
};

export default memo(Comp);
