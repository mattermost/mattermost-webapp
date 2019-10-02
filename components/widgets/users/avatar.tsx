// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import './avatar.scss';

type Props = {
    url: string;
    username?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
};

const Avatar: React.FunctionComponent<Props> = ({url, username, size = 'md'}) => (
    <img
        className={`Avatar Avatar-${size}`}
        alt={`${username || 'user'} profile image`}
        src={url}
    />
);

Avatar.propTypes = {
    url: PropTypes.string.isRequired,
    username: PropTypes.string,
    size: PropTypes.oneOf<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'>(['xs', 'sm', 'md', 'lg', 'xl', 'xxl']),
};

Avatar.defaultProps = {
    size: 'md',
};

export default Avatar;
