// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {ShortcutKey, ShortcutKetVariant} from 'components/shortcut_key';

import * as Utils from 'utils/utils.jsx';

export const SearchShortcut = () => {
    const controlKey = Utils.isMac() ? '⌘' : 'Ctrl';

    return (
        <React.Fragment>
            <ShortcutKey variant={ShortcutKetVariant.contrast}>{controlKey}</ShortcutKey>
            <ShortcutKey variant={ShortcutKetVariant.contrast}>{'Shift'}</ShortcutKey>
            <ShortcutKey variant={ShortcutKetVariant.contrast}>{'F'}</ShortcutKey>
        </React.Fragment>
    );
};
