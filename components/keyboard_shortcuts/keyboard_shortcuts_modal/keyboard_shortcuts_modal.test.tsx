// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import KeyboardShortcutsModal from 'components/keyboard_shortcuts/keyboard_shortcuts_modal/keyboard_shortcuts_modal';

jest.mock('react-intl', () => {
    const reactIntl = jest.requireActual('react-intl');
    return {
        ...reactIntl,
        useIntl: () => reactIntl.createIntl({locale: 'en', defaultLocale: 'en', timeZone: 'Etc/UTC', textComponent: 'span'}),
    };
});

describe('components/KeyboardShortcutsModal', () => {
    test('should match snapshot modal', () => {
        const wrapper = shallow(
            <KeyboardShortcutsModal onExited={jest.fn()}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
