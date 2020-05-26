// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {TeamProfile} from './team_profile.jsx';

describe('admin_console/team_channel_settings/team/TeamProfile', () => {
    test('should match snapshot', () => {
        const wrapper = shallow(
            <TeamProfile
                team={{display_name: 'test'}}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
