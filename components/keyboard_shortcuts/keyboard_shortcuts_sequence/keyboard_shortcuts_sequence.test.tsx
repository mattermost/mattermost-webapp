// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import KeyboardShortcutsSequence from './keyboard_shortcuts_sequence';

describe('components/shortcuts/KeyboardShortcutsSequence', () => {
    test('should match snapshot modal for Mac', () => {
        const wrapper = mountWithIntl(
            <KeyboardShortcutsSequence
                shortcut={{
                    id: 'test',
                    defaultMessage: 'Keyboard Shortcuts\t⌘|/',
                }}
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
