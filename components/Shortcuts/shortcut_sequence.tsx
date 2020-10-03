// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {MessageDescriptor} from 'react-intl';

type Props = {
    shortcut: MessageDescriptor;
};

export default function ShortcutSequence({shortcut}: Props) {
    if (!shortcut?.defaultMessage) {
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
