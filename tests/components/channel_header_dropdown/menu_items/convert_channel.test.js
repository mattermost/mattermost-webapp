// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {ConvertChannel} from 'components/channel_header_dropdown/menu_items';

describe('components/ChannelHeaderDropdown/MenuItem.ConvertChannel', () => {
    it('should match snapshot', () => {
        const wrapper = shallow(
            <ConvertChannel
                channel={{
                    id: 'channel_id',
                    team_id: 'team_id',
                    display_name: 'Test',
                }}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });
});
