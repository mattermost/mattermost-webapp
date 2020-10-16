// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {useIntl, MessageDescriptor, IntlFormatters} from 'react-intl';

type Props = {
    shortcut: MessageDescriptor;
    values?: Parameters<IntlFormatters['formatMessage']>[1],
    hideDescription?: boolean;
};

export default function ShortcutSequence({shortcut, values, hideDescription}: Props) {
    const {formatMessage} = useIntl();
    console.log(values);
    const shortcutText = formatMessage(shortcut, values);
    const splitShorcut = shortcutText.split('\t');

    let description;
    let keys;

    if (splitShorcut.length > 1) {
        description = splitShorcut[0];
        keys = splitShorcut[1];
    } else if (splitShorcut.includes('|')) {
        keys = splitShorcut[0];
    } else {
        description = splitShorcut[0];
    }

    return (
        <div className='shortcut-line'>
            <div>{!hideDescription && description}</div>
            {keys?.split('|').map((key: string) => (
                <span
                    className='shortcut-key'
                    key={key}
                >
                    {key}
                </span>
            ))}
        </div>);
}
