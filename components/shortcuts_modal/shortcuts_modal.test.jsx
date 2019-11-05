// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import ShortcutsModal from './shortcuts_modal.jsx';

describe('components/ShortcutsModal', () => {
    const onHide = () => {};
    test('should match snapshot modal for Mac', () => {
        const wrapper = mountWithIntl(
            <ShortcutsModal
                isMac={true}
                show={false}
                onHide={onHide}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot modal for non-Mac like Windows/Linux', () => {
        const wrapper = mountWithIntl(
            <ShortcutsModal
                isMac={false}
                show={false}
                onHide={onHide}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });
});
