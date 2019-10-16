// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import './avatar.scss';

type Props = {
    url: string;
    username?: string;
    size?: string;
};

const Avatar: React.FunctionComponent<Props> = ({url, username, size = 'md'}: Props) => (
    <img
        className={`Avatar Avatar-${size}`}
        alt={`${username || 'user'} profile image`}
        src={url}
    />
);

Avatar.defaultProps = {
    size: 'md',
};

export default Avatar;
