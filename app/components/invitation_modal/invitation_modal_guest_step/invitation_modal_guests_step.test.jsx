// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import InvitationModalGuestsStep from './invitation_modal_guests_step.jsx';

describe('components/invitation_modal/InvitationModalGuestsStep', () => {
    const props = {
        teamName: 'Test Team',
        currentTeamId: 'test-team-id',
        inviteId: '123',
        searchProfiles: jest.fn(),
        emailInvitationsEnabled: true,
        onSubmit: jest.fn(),
        onEdit: jest.fn(),
        userIsAdmin: true,
        userLimit: '0',
        currentUsers: 4,
        isCloud: false,
        subscription: {
            is_paid_tier: 'false',
        },
        myInvitableChannels: [],
        searchChannels: jest.fn(),
        analytics: {
            TOTAL_USERS: 10,
        },
        actions: {
            getStandardAnalytics: () => {},
            getCloudSubscription: () => {},
        },
    };
    test('should match the snapshot', () => {
        const wrapper = shallow(
            <InvitationModalGuestsStep
                {...props}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot when email invitations are disabled', () => {
        const wrapper = shallow(
            <InvitationModalGuestsStep
                {...props}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
