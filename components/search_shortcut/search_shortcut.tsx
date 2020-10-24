// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {ShortcutKey, ShortcutKetVariant} from 'components/shortcut_key';

import * as Utils from 'utils/utils.jsx';

export const SearchShortcut = () => {
    const controlKey = Utils.isMac() ? '⌘' : 'Ctrl';

    return (
        <React.Fragment>
            <ShortcutKey variant={ShortcutKetVariant.Contrast}>{controlKey}</ShortcutKey>
            <ShortcutKey variant={ShortcutKetVariant.Contrast}>{'Shift'}</ShortcutKey>
            <ShortcutKey variant={ShortcutKetVariant.Contrast}>{'F'}</ShortcutKey>
        </React.Fragment>
    );
};
