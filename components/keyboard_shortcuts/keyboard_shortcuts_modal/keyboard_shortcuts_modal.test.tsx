// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import KeyboardShortcutsModal from 'components/keyboard_shortcuts/keyboard_shortcuts_modal/keyboard_shortcuts_modal';

describe('components/KeyboardShortcutsModal', () => {
    test('should match snapshot modal', () => {
        const wrapper = mountWithIntl(
            <KeyboardShortcutsModal/>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
