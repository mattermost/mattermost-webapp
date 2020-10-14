// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, ComponentProps} from 'react';
import {useIntl} from 'react-intl';
import classNames from 'classnames';

import './thread_header.scss';

import ThreadMenu from '../thread_menu';
import Button from '../../common/button';
import FollowButton from '../../common/follow_button';

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

} & Pick<ComponentProps<typeof ThreadMenu>, 'actions'>;

const ThreadHeader = ({
    channelName,
    isFollowing,
    actions: {
        follow,
        unfollow,
        openInChannel,
    },
}: Props) => {
    const {formatMessage} = useIntl();
    return (
        <header className={classNames('ThreadHeader')}>
            <div>
                <h3 className='Separated'>
                    {formatMessage({
                        id: 'threading.header.heading',
                        defaultMessage: 'Thread',
                    })}
                </h3>
                <Button onClick={openInChannel}>
                    {channelName}
                </Button>
            </div>
            <div>
                <FollowButton
                    isFollowing={isFollowing}
                    start={follow}
                    stop={unfollow}
                />
            </div>
        </header>
    );
};

export default memo(ThreadHeader);
