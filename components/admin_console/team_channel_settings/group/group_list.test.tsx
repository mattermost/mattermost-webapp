// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Group} from 'mattermost-redux/types/groups';

import GroupList from './group_list';

describe('admin_console/team_channel_settings/group/GroupList', () => {
    test('should match snapshot', () => {
        const testGroups: Array<Partial<Group>> = [{
            id: '123',
            display_name: 'DN',
            member_count: 3,

        }];

        const actions = {
            getData: jest.fn().mockResolvedValue(testGroups),
        };

        const wrapper = shallow(
            <GroupList
                data={testGroups}
                onPageChangedCallback={jest.fn()}
                total={testGroups.length}
                emptyListTextId={'test'}
                emptyListTextDefaultMessage={'test'}
                actions={actions}
                removeGroup={jest.fn()}
                type='team'
                setNewGroupRole={jest.fn()}
            />);
        wrapper.setState({loading: false});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with paging', () => {
        const testGroups: Array<Partial<Group>> = [];
        for (let i = 0; i < 30; i++) {
            testGroups.push({
                id: 'id' + i,
                display_name: 'DN' + i,
                member_count: 3,
            });
        }
        const actions = {
            getData: jest.fn().mockResolvedValue(Promise.resolve(testGroups)),
        };

        const wrapper = shallow(
            <GroupList
                data={testGroups}
                onPageChangedCallback={jest.fn()}
                total={30}
                emptyListTextId={'test'}
                emptyListTextDefaultMessage={'test'}
                actions={actions}
                type='team'
                removeGroup={jest.fn()}
                setNewGroupRole={jest.fn()}
            />);
        wrapper.setState({loading: false});
        expect(wrapper).toMatchSnapshot();
    });
});
