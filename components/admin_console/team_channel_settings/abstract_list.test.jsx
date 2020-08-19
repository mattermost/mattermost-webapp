// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {shallow} from 'enzyme';

import AbstractList from './abstract_list';
import ChannelRow from './channel/list/channel_row';

describe('admin_console/team_channel_settings/AbstractList', () => {
    const header = (
        <div className='groups-list--header'>
            <div className='group-name adjusted'>
                <FormattedMessage
                    id='admin.channel_settings.channel_list.nameHeader'
                    defaultMessage='Name'
                />
            </div>
            <div className='group-content'>
                <div className='group-description'>
                    <FormattedMessage
                        id='admin.channel_settings.channel_list.teamHeader'
                        defaultMessage='Team'
                    />
                </div>
                <div className='group-description adjusted'>
                    <FormattedMessage
                        id='admin.channel_settings.channel_list.managementHeader'
                        defaultMessage='Management'
                    />
                </div>
                <div className='group-actions'/>
            </div>
        </div>);

    test('should match snapshot, no headers', () => {
        const testChannels = [];

        const actions = {
            getData: jest.fn().mockResolvedValue(testChannels),
            searchAllChannels: jest.fn().mockResolvedValue(testChannels),
            removeGroup: jest.fn(),
        };

        const wrapper = shallow(
            <AbstractList
                onPageChangedCallback={jest.fn()}
                total={0}
                header={header}
                renderRow={renderRow}
                emptyListTextId={'test'}
                emptyListTextDefaultMessage={'test'}
                actions={actions}
            />);

        wrapper.setState({loading: false});
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, with data', () => {
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
            <AbstractList
                data={testChannels}
                onPageChangedCallback={jest.fn()}
                total={testChannels.length}
                header={header}
                renderRow={renderRow}
                emptyListTextId={'test'}
                emptyListTextDefaultMessage={'test'}
                actions={actions}
            />);

        wrapper.setState({loading: false});
        expect(wrapper).toMatchSnapshot();
    });

    const renderRow = jest.fn((item) => {
        return (
            <ChannelRow
                key={item.id}
                channel={item.display_name}
                onRowClick={jest.fn()}
            />
        );
    });
});
