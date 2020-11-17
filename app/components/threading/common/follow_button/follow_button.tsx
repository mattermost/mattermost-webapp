// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, ComponentProps, MouseEventHandler} from 'react';
import {FormattedMessage} from 'react-intl';

import Button from '../button';

type Props = {
    isFollowing: boolean;
    follow: MouseEventHandler<HTMLButtonElement>,
    unFollow: MouseEventHandler<HTMLButtonElement>;
}

function FollowButton({
    isFollowing,
    follow,
    unFollow,
    ...props
}: Props & Exclude<ComponentProps<typeof Button>, Props>) {
    return (
        <Button
            {...props}
            onClick={isFollowing ? unFollow : follow}
            isActive={isFollowing}
        >
            {isFollowing ? (
                <FormattedMessage
                    id='threading.following'
                    defaultMessage='Following'
                />
            ) : (
                <FormattedMessage
                    id='threading.notFollowing'
                    defaultMessage='Follow'
                />
            )}
        </Button>
    );
}

export default memo(FollowButton);
