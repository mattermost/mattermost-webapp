import React from 'react';
import {getCompassIconClassName} from 'utils/utils';
import {CommonProps} from './common_props';

export default function Icon({src, width}: {src?: string; width: string;}) {
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
