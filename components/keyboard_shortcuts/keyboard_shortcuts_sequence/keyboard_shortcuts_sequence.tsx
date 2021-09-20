// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {FormatXMLElementFn, PrimitiveType} from 'intl-messageformat';
import React, {memo} from 'react';
import {useIntl} from 'react-intl';

import {isMessageDescriptor, KeyboardShortcutsSeq} from '../keyboard_shortcuts';

import {isMac} from '../../../utils/utils';
import './keyboard_shortcuts_sequence.scss';
import {ShortcutKetVariant, ShortcutKey} from '../../shortcut_key';

type Props = {
    shortcut: KeyboardShortcutsSeq;
    values?: Record<string, PrimitiveType | FormatXMLElementFn<string, string>>;
    hideDescription?: boolean;
    hoistDescription?: boolean;
    isInsideTooltip?: boolean;
};

function normalize(shortcut: KeyboardShortcutsSeq) {
    if (isMessageDescriptor(shortcut)) {
        return shortcut;
    }

    const {default: standard, mac} = shortcut;
    return isMac() && mac ? mac : standard;
}

const KEY_SEPARATOR = '|';

function KeyboardShortcutSequence({shortcut, values, hideDescription, hoistDescription, isInsideTooltip}: Props) {
    const {formatMessage} = useIntl();
    const shortcutText = formatMessage(normalize(shortcut), values);
    const splitShortcut = shortcutText.split('\t');

    let description: string | undefined;
    let keys: string | undefined;

    if (splitShortcut.length > 1) {
        description = splitShortcut[0];
        keys = splitShortcut[1];
    } else if (splitShortcut[0].includes(KEY_SEPARATOR)) {
        keys = splitShortcut[0];
    } else {
        description = splitShortcut[0];
    }

    if (hideDescription) {
        description = undefined;
    }

    return (
        <>
            {hoistDescription && description?.replace(/:{1,2}$/, '')}
            <div className='shortcut-line'>
                {!hoistDescription && description && <span>{description}</span>}
                {keys?.split(KEY_SEPARATOR).map((key) => (
                    <ShortcutKey
                        key={key}
                        variant={isInsideTooltip ? ShortcutKetVariant.Tooltip : ShortcutKetVariant.ShortcutModal}
                    >
                        {key}
                    </ShortcutKey>
                ))}
            </div>
        </>
    );
}
export default memo(KeyboardShortcutSequence);
