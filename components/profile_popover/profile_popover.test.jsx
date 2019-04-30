// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper.jsx';
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
        canManageAnyChannelMembersInCurrentTeam: true,
        actions: {
            getMembershipForCurrentEntities: jest.fn(),
            openDirectChannelToUserId: jest.fn(),
            openModal: jest.fn(),
            loadBot: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const props = {...baseProps};

        const wrapper = shallowWithIntl(
            <ProfilePopover {...props}/>
        ).dive();
        expect(wrapper).toMatchSnapshot();
    });
});
