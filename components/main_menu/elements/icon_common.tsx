// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';

interface Props {
    glyph: string;
    size: string;
    label: string;
    additionalClass?: string;
}

const IconCommon: React.FC<Props> = ({glyph, size, label, additionalClass}: Props) => {
    return (
        <div
            className='Icon__wrapper'
        >
            <i
                className={classNames([`Icon Icon___${size} icon-${glyph} ${additionalClass}`])}
                aria-label={label}
            />
        </div>
    );
};

export default IconCommon;
