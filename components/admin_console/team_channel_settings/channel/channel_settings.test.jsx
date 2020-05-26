// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {ChannelsSettings} from './channel_settings.jsx';

describe('admin_console/team_channel_settings/channel/ChannelSettings', () => {
    test('should match snapshot', () => {
        const wrapper = shallow(
            <ChannelsSettings
                siteName='site'
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
