// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, HTMLAttributes} from 'react';
import classNames from 'classnames';
import tinycolor from 'tinycolor2';
import {useSelector} from 'react-redux';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import './avatar.scss';

type Props = {
    url?: string;
    username?: string;
    size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
    text?: string;
};

type Attrs = HTMLAttributes<HTMLElement>;

const Avatar = ({
    url,
    username,
    size = 'md',
    text,
    ...attrs
}: Props & Attrs) => {
    const classes = classNames(`Avatar Avatar-${size}`, attrs.className);
    const {centerChannelBg, centerChannelColor} = useSelector(getTheme);

    if (text) {
        return (
            <div
                {...attrs}
                style={{
                    background: tinycolor.mix(centerChannelBg, centerChannelColor, 8).toRgbString(),
                    ...attrs.style,
                }}
                className={classes + ' Avatar-plain'}
                data-content={text}
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
