// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {range} from 'lodash';

import GroupUsers from './group_users';

describe('admin_console/team_channel_settings/group/GroupUsers', () => {
    const defaultProps = {
        members: range(0, 20).map((i) => ({
            id: 'id' + i,
            username: 'username' + i,
            first_name: 'Name' + i,
            last_name: 'Surname' + i,
            email: 'test' + i + '@test.com',
            last_picture_update: i,
        })),
        total: 20,
    };

    test('should match snapshot, on loading without data', () => {
        const wrapper = shallow(
            <GroupUsers
                {...defaultProps}
                members={[]}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on loading with data', () => {
        const wrapper = shallow(<GroupUsers {...defaultProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, loaded with multiple pages', () => {
        const wrapper = shallow(
            <GroupUsers
                {...defaultProps}
                total={55}
            />
        );

        // First page
        wrapper.setState({page: 0});
        expect(wrapper).toMatchSnapshot();

        // Intermediate page
        wrapper.setState({page: 1});
        expect(wrapper).toMatchSnapshot();

        // Last page page
        wrapper.setState({page: 2});
        expect(wrapper).toMatchSnapshot();
    });
});
