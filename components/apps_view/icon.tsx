// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

export default function Icon({src, width}: {src?: string; width: string}) {
    if (!src) {
        return null;
    }

    const style = {
        width,
    };

    if (src.startsWith('http://') || src.startsWith('https://')) {
        return (
            <img
                style={style}
                src={src}
            />
        );
    }

    if (src.startsWith('fa-')) {
        return (
            <i
                style={style}
                className={'fa ' + src}
            />
        );
    }

    if (src.startsWith('icon-')) {
        return (
            <i
                style={style}
                className={'icon ' + src}
            />
        );
    }

    return null;
}
