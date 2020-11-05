// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import ShortcutsModal from './shortcuts_modal';

describe('components/shortcuts/ShortcutsModal', () => {
    test('should match snapshot', () => {
        const wrapper = mountWithIntl(
            <ShortcutsModal/>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
