// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {ShortcutKey, ShortcutKeyVariant} from 'components/shortcut_key';

import {isMac} from 'utils/utils.jsx';
import {isDesktopApp} from 'utils/user_agent';
import './search_shortcut.scss';

export const SearchShortcut = () => {
    const controlKey = isMac() ? '⌘' : 'Ctrl';

    return (
        <span className='search-shortcut'>
            <ShortcutKey variant={ShortcutKeyVariant.Contrast}>{controlKey}</ShortcutKey>
            {!isDesktopApp() && <ShortcutKey variant={ShortcutKeyVariant.Contrast}>{'Shift'}</ShortcutKey>}
            <ShortcutKey variant={ShortcutKeyVariant.Contrast}>{'F'}</ShortcutKey>
        </span>
    );
};
