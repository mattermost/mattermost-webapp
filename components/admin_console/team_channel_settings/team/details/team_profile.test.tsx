// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ComponentProps} from 'react';
import {shallow} from 'enzyme';

import {TestHelper} from 'utils/test_helper';

import {TeamProfile} from './team_profile';

describe('admin_console/team_channel_settings/team/TeamProfile', () => {
    const baseProps: ComponentProps<typeof TeamProfile> = {
        team: TestHelper.getTeamMock(),
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
