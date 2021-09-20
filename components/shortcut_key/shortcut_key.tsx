// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import './shortcut_key.scss';

export enum ShortcutKetVariant {
    Contrast = 'contrast',
    Tooltip = 'tooltip',
    ShortcutModal = 'shortcut',
}

export type ShortcutKeyProps = {
    variant?: ShortcutKetVariant;
    children: React.ReactNode;
}

export const ShortcutKey = ({children, variant}: ShortcutKeyProps) => {
    let className = 'shortcut-key';
    if (variant === ShortcutKetVariant.Contrast) {
        className += ' shortcut-key--contrast';
    } else if (variant === ShortcutKetVariant.Tooltip) {
        className += ' shortcut-key--tooltip';
    } else if (variant === ShortcutKetVariant.ShortcutModal) {
        className += ' shortcut-key--shortcut-modal';
    }

    return (
        <mark className={className}>
            {children}
        </mark>
    );
};
