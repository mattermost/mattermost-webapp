// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {ShortcutKey, ShortcutKetVariant} from 'components/shortcut_key';

import {isMac} from 'utils/utils.jsx';
import {isDesktopApp} from 'utils/user_agent';
import './search_shortcut.scss';

export const SearchShortcut = () => {
    const controlKey = isMac() ? '⌘' : 'Ctrl';

    return (
        <span className='search-shortcut'>
            <ShortcutKey variant={ShortcutKetVariant.Contrast}>{controlKey}</ShortcutKey>
            {!isDesktopApp() && <ShortcutKey variant={ShortcutKetVariant.Contrast}>{'Shift'}</ShortcutKey>}
            <ShortcutKey variant={ShortcutKetVariant.Contrast}>{'F'}</ShortcutKey>
        </span>
    );
};
