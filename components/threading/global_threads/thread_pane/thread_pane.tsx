// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, ComponentProps, useCallback, ReactNode} from 'react';
import {useIntl} from 'react-intl';

import {t} from 'utils/i18n';

import './thread_pane.scss';

import ThreadMenu from '../thread_menu';
import Button from '../../common/button';
import FollowButton from '../../common/follow_button';
import SimpleTooltip from 'components/widgets/simple_tooltip';
import Header from 'components/widgets/header';

type Props = {
    channelName: string;
    isFollowing: boolean;
    isSaved: boolean;
    children: ReactNode;
    actions: {
        follow: () => void;
        unFollow: () => void;
        openInChannel: () => void;
    };
} & Omit<ComponentProps<typeof ThreadMenu>, 'children'>;

const ThreadHeader = ({
    channelName,
    isFollowing,
    isSaved,
    hasUnreads,
    children,
    actions,
}: Props) => {
    const {formatMessage} = useIntl();
    return (
        <div className='ThreadPane'>
            <Header
                className='ThreadPane___header'
                heading={(
                    <h3>
                        <span className='separated'>
                            {formatMessage({
                                id: 'threading.header.heading',
                                defaultMessage: 'Thread',
                            })}
                        </span>
                        <Button
                            className='separated'
                            onClick={useCallback(actions.openInChannel, [actions.openInChannel])}
                        >
                            {channelName}
                        </Button>
                    </h3>
                )}
                right={(
                    <>
                        <FollowButton
                            isFollowing={isFollowing}
                            follow={useCallback(actions.follow, [actions.follow])}
                            unFollow={useCallback(actions.unFollow, [actions.unFollow])}
                        />
                        <ThreadMenu
                            isFollowing={isFollowing}
                            isSaved={isSaved}
                            hasUnreads={hasUnreads}
                            actions={actions}
                        >
                            <SimpleTooltip
                                id='threadActionMenu'
                                content={formatMessage({
                                    id: t('threading.threadHeader.menu'),
                                    defaultMessage: 'More Actions',
                                })}
                            >
                                <Button className='Button___icon Button___large'>
                                    <i className='Icon icon-dots-vertical'/>
                                </Button>
                            </SimpleTooltip>
                        </ThreadMenu>
                    </>
                )}
            />
            {children}
        </div>
    );
};

export default memo(ThreadHeader);
