// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, ComponentProps, useCallback} from 'react';
import {useIntl} from 'react-intl';
import classNames from 'classnames';

import {t} from 'utils/i18n';

import './thread_header.scss';

import ThreadMenu from '../thread_menu';
import Button from '../../common/button';
import FollowButton from '../../common/follow_button';
import SimpleTooltip from 'components/widgets/simple_tooltip';

type Props = {
    channelName: string,
    isFollowing: boolean,
    isSaved: boolean,
    actions: {
        follow: () => void,
        unFollow: () => void,
        openInChannel: () => void,
    }

} & ComponentProps<typeof ThreadMenu>;

const ThreadHeader = ({
    channelName,
    isFollowing,
    isSaved,
    hasUnreads,
    actions,
}: Props) => {
    const {formatMessage} = useIntl();
    return (
        <header className={classNames('ThreadHeader')}>
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
            <div className='spacer'/>
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
        </header>
    );
};

export default memo(ThreadHeader);
