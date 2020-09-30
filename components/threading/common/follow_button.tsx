// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {FC, memo, ComponentProps, MouseEventHandler} from 'react';
import {FormattedMessage} from 'react-intl';

import Button from './button';

type Props = {
    isFollowing: boolean;
    start: MouseEventHandler<HTMLButtonElement>,
    stop: MouseEventHandler<HTMLButtonElement>;
}

const FollowButton: FC<Props & Exclude<ComponentProps<typeof Button>, Props>> = ({
    isFollowing,
    start,
    stop,
    ...props
}) => {
    return (
        <Button
            {...props}
            onClick={isFollowing ? stop : start}
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
};

export default memo(FollowButton);
