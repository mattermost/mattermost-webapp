// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {TeamProfile} from './team_profile.jsx';

describe('admin_console/team_channel_settings/team/TeamProfile', () => {
    const baseProps = {
        team: {
            display_name: 'test',
        },
        onToggleArchive: jest.fn(),
        isArchived: false,
    };
    test('should match snapshot', () => {
        const wrapper = shallow(
            <TeamProfile
                {...baseProps}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with isArchived true', () => {
        const props = {
            ...baseProps,
            isArchived: true,
        };
        const wrapper = shallow(
            <TeamProfile
                {...props}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
