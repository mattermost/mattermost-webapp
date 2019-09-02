// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import TeamList from './team_list.jsx';

describe('admin_console/team_channel_settings/team/TeamList', () => {
    test('should match snapshot', () => {
        const testTeams = [{
            id: '123',
            display_name: 'DN',
        }];

        const actions = {
            getData: jest.fn().mockResolvedValue(testTeams),
            removeGroup: jest.fn(),
        };

        const wrapper = shallow(
            <TeamList
                removeGroup={jest.fn()}
                data={testTeams}
                onPageChangedCallback={jest.fn()}
                total={testTeams.length}
                emptyListTextId={'test'}
                emptyListTextDefaultMessage={'test'}
                actions={actions}
            />);

        wrapper.setState({loading: false});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with paging', () => {
        const testTeams = [];
        for (let i = 0; i < 30; i++) {
            testTeams.push({
                id: 'id' + i,
                display_name: 'DN' + i,
            });
        }
        const actions = {
            getData: jest.fn().mockResolvedValue(Promise.resolve(testTeams)),
            removeGroup: jest.fn(),
        };

        const wrapper = shallow(
            <TeamList
                removeGroup={jest.fn()}
                data={testTeams}
                onPageChangedCallback={jest.fn()}
                total={30}
                emptyListTextId={'test'}
                emptyListTextDefaultMessage={'test'}
                actions={actions}
            />);
        wrapper.setState({loading: false});
        expect(wrapper).toMatchSnapshot();
    });
});
