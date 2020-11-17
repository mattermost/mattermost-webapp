// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import UserList from './user_list.jsx';

describe('components/UserList', () => {
    test('should match default snapshot', () => {
        const wrapper = shallow(
            <UserList/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match default snapshot when there are users', () => {
        const props = {
            users: [
                {id: 'id1'},
                {id: 'id2'},
            ],
            actionUserProps: {},
        };
        const wrapper = shallow(
            <UserList {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
