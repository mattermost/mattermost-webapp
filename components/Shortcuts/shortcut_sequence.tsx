// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

export default function ShortcutSequence({shortcut}) {
    if (!shortcut) {
        return null;
    }

    const shortCut = shortcut.defaultMessage.split('\t');
    let keys = null;
    if (shortCut.length > 1) {
        keys = shortCut[1].split('|').map((key) => (
            <span
                className='shortcut-key'
                key={key}
            >
                {key}
            </span>
        ));
    }

    return <div className='shortcut-line'>{keys}</div>;
}
