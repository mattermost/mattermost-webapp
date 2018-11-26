// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ProfilePopover from 'components/profile_popover/profile_popover';

describe('components/ProfilePopover', () => {
    const baseProps = {
        user: {
            name: 'some name',
            username: 'some_username',
        },
        src: 'src',
        currentUserId: '',
        currentTeamId: 'team_id',
        isChannelAdmin: false,
        isTeamAdmin: false,
        teamUrl: '',
        actions: {
            getMembershipForCurrentEntities: jest.fn(),
            openDirectChannelToUserId: jest.fn(),
            openModal: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const props = {...baseProps};

        const wrapper = shallow(
            <ProfilePopover {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });
});
