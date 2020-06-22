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

const Icon: React.FC<Props> = ({glyph, size, label, additionalClass}: Props) => {
    return (
        <i
            className={classNames([`Icon Icon___${size} icon-${glyph}`, {additionalClass}])}
            aria-label={label}
        />
    );
};

export default Icon;

export const iconGlyphs = {
    EMOTICON_HAPPY_OUTLINE: 'icon-emoticon-happy-outline',
};
