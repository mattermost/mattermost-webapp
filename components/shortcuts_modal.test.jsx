// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import ShortcutsModal from 'components/shortcuts_modal.jsx';

describe('components/ShortcutsModal', () => {
    test('should match snapshot modal for Mac', () => {
        const wrapper = mountWithIntl(
            <ShortcutsModal isMac={true}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot modal for non-Mac like Windows/Linux', () => {
        const wrapper = mountWithIntl(
            <ShortcutsModal isMac={false}/>
        );

        expect(wrapper).toMatchSnapshot();
    });
});
