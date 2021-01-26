// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import InvitationModalMembersStep from './invitation_modal_members_step.jsx';

describe('components/invitation_modal/InvitationModalMembersStep', () => {
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
        analytics: {
            TOTAL_USERS: 10,
        },
        actions: {
            getStandardAnalytics: () => {},
            getCloudSubscription: () => {},
        },
    };

    test('should match the snapshot', () => {
        const wrapper = shallowWithIntl(
            <InvitationModalMembersStep
                {...props}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot when email invitations are disabled', () => {
        const wrapper = shallowWithIntl(
            <InvitationModalMembersStep
                {...props}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
