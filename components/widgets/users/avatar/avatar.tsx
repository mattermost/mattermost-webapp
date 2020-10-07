// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, HTMLAttributes} from 'react';

import './avatar.scss';

type Props = {
    url?: string;
    username?: string;
    size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
    children?: string;
};

type Attrs = Pick<HTMLAttributes<HTMLElement>, 'tabIndex'>

const Avatar = ({
    url,
    username,
    size = 'md',
    children,
    ...attrs
}: Props & Attrs) => {
    const classes = `Avatar Avatar-${size}`;

    if (children) {
        return (
            <div
                {...attrs}
                className={classes + ' Avatar-plain'}
                data-content={children}
            />
        );
    }

    return (
        <img
            {...attrs}
            className={classes}
            alt={`${username || 'user'} profile image`}
            src={url}
        />
    );
};
export default memo(Avatar);
