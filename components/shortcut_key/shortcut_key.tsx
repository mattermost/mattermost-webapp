// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import './shortcut_key.scss';
import classNames from 'classnames';

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
    return (
        <mark
            className={classNames('shortcut-key', {
                'shortcut-key--contrast': variant === ShortcutKetVariant.Contrast,
                'shortcut-key--tooltip': variant === ShortcutKetVariant.Tooltip,
                'shortcut-key--shortcut-modal': variant === ShortcutKetVariant.ShortcutModal,
            })}
        >
            {children}
        </mark>
    );
};
