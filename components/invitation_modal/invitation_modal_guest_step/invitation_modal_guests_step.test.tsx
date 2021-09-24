// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import InvitationModalGuestsStep from './index';

describe('components/invitation_modal/InvitationModalGuestsStep', () => {
    const props = {
        teamName: 'Test Team',
        currentTeamId: 'test-team-id',
        inviteId: '123',
        searchProfiles: jest.fn(),
        emailInvitationsEnabled: true,
        onSubmit: jest.fn(),
        onEdit: jest.fn(),
        currentUsers: 4,
        myInvitableChannels: [],
        searchChannels: jest.fn(),
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
