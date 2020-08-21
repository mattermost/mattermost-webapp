// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {FC, memo} from 'react';

import './avatar.scss';

export type Props = {
    url?: string;
    username?: string;
    size?: string;
    children?: string;
};

const Avatar: FC<Props> = ({
    url,
    username,
    size = 'md',
    children
}: Props) => {
    const classes = `Avatar Avatar-${size}`;

    if (children) {
        return (
            <div
                className={classes + ' Avatar-plain'}
                data-content={children}
            />
        );
    }

    return (
        <img
            className={classes}
            alt={`${username || 'user'} profile image`}
            src={url}
        />
    );
};
export default memo(Avatar);
