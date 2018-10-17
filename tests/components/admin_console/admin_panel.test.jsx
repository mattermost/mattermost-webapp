// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import AdminPanel from 'components/admin_console/admin_panel.jsx';

describe('components/admin_console/AdminPanel', () => {
    test('should match snapshot, without footer', () => {
        const wrapper = shallow(
            <AdminPanel
                id='id'
                titleId='i18n.title'
                titleDefaultMessage='Title'
                subtitleId='i18n.subtitle'
                subtitleDefaultMessage='Subtitle'
            >
                {'Test'}
            </AdminPanel>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, with footer', () => {
        const wrapper = shallow(
            <AdminPanel
                id='id'
                titleId='i18n.title'
                titleDefaultMessage='Title'
                subtitleId='i18n.subtitle'
                subtitleDefaultMessage='Subtitle'
                footer={'Footer'}
            >
                {'Test'}
            </AdminPanel>
        );
        expect(wrapper).toMatchSnapshot();
    });
});
