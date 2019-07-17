// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {ChannelProfile} from './channel_profile.jsx';

describe('admin_console/team_channel_settings/channel/ChannelProfile', () => {
    test('should match snapshot', () => {
        const wrapper = shallow(
            <ChannelProfile
                team={{display_name: 'test'}}
                channel={{name: 'test'}}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});
