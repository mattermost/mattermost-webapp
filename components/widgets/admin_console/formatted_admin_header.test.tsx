// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import FormattedAdminHeader from './formatted_admin_header';

describe('components/widgets/admin_console/FormattedAdminHeader', () => {
    test('render component with required props', () => {
        const wrapper = shallow(
            <FormattedAdminHeader
                id='string.id'
                defaultMessage='default message'
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('render component with all props', () => {
        const wrapper = shallow(
            <FormattedAdminHeader
                id='string.id'
                defaultMessage='default message'
                values={{
                    a_key: 'a_value',
                }}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});
