// Copyright (c) 2018-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import AdminSidebarHeader from 'components/admin_console/admin_sidebar_header/admin_sidebar_header.jsx';

describe('components/AdminSidebarHeader', () => {
    const baseProps = {
        user: {id: 'someid', last_picture_update_at: 1234},
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <AdminSidebarHeader {...baseProps}/>
        );
        expect(wrapper).toMatchSnapshot();
    });
});
