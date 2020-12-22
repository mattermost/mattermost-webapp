// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, ComponentProps, MouseEventHandler} from 'react';
import {useIntl} from 'react-intl';

import Button from '../button';
import {t} from 'utils/i18n';

type Props = {
    isFollowing: boolean;
    follow: MouseEventHandler<HTMLButtonElement>;
    unFollow: MouseEventHandler<HTMLButtonElement>;
}

function FollowButton({
    isFollowing,
    follow,
    unFollow,
    ...props
}: Props & Exclude<ComponentProps<typeof Button>, Props>) {
    const {formatMessage} = useIntl();
    return (
        <Button
            {...props}
            onClick={isFollowing ? unFollow : follow}
            isActive={isFollowing}
        >
            {formatMessage(isFollowing ? {
                id: t('threading.following'),
                defaultMessage: 'Following',
            } : {
                id: t('threading.notFollowing'),
                defaultMessage: 'Follow',
            })}
        </Button>
    );
}

export default memo(FollowButton);
