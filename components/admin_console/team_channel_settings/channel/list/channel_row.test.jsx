// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ChannelRow from './channel_row.jsx';

describe('admin_console/team_channel_settings/channel/ChannelRow', () => {
    const testChannel = {
        id: '123',
        team_name: 'team',
        type: 'O',
        group_constrained: false,
        name: 'DN',
    };
    test('should match snapshot', () => {
        const wrapper = shallow(
            <ChannelRow

                onRowClick={jest.fn()}
                channel={testChannel}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});
