// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ChannelList from './channel_list';

describe('admin_console/team_channel_settings/channel/ChannelList', () => {
    test('should match snapshot', () => {
        const testChannels = [{
            id: '123',
            display_name: 'DN',
        }];

        const actions = {
            getData: jest.fn().mockResolvedValue(testChannels),
            searchAllChannels: jest.fn().mockResolvedValue(testChannels),
            removeGroup: jest.fn(),
        };

        const wrapper = shallow(
            <ChannelList
                removeGroup={jest.fn()}
                data={testChannels}
                onPageChangedCallback={jest.fn()}
                total={testChannels.length}
                emptyListTextId={'test'}
                emptyListTextDefaultMessage={'test'}
                actions={actions}
            />);

        wrapper.setState({loading: false});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with paging', () => {
        const testChannels = [];
        for (let i = 0; i < 30; i++) {
            testChannels.push({
                id: 'id' + i,
                display_name: 'DN' + i,
            });
        }
        const actions = {
            getData: jest.fn().mockResolvedValue(Promise.resolve(testChannels)),
            searchAllChannels: jest.fn().mockResolvedValue(Promise.resolve(testChannels)),
            removeGroup: jest.fn(),
        };

        const wrapper = shallow(
            <ChannelList
                removeGroup={jest.fn()}
                data={testChannels}
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
