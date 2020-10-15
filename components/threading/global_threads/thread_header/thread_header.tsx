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
    isSelected: boolean,
    actions: {
        follow: () => void,
        unfollow: () => void,
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
                <span className='Separated'>
                    {formatMessage({
                        id: 'threading.header.heading',
                        defaultMessage: 'Thread',
                    })}
                </span>
                <Button onClick={useCallback(actions.openInChannel, [])}>
                    {channelName}
                </Button>
            </h3>
            <div className='spacer'/>
            <FollowButton
                isFollowing={isFollowing}
                start={useCallback(actions.follow, [])}
                stop={useCallback(actions.unfollow, [])}
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
                    <Button className='Button___icon Button___large Margined'>
                        <i className='Icon icon-dots-vertical'/>
                    </Button>
                </SimpleTooltip>
            </ThreadMenu>
        </header>
    );
};

export default memo(ThreadHeader);
