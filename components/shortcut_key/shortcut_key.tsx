// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import './shortcut_key.scss';

export enum ShortcutKetVariant {
    Contrast = 'contrast',
}

export type ShortcutKeyProps = {
    variant?: ShortcutKetVariant;
    children: React.ReactNode;
}

export const ShortcutKey = ({children, variant}: ShortcutKeyProps) => {
    let className = 'shortcut-key';
    if (variant === ShortcutKetVariant.Contrast) {
        className += ' shortcut-key--contrast';
    }

    return (
        <mark className={className}>
            {children}
        </mark>
    );
};
