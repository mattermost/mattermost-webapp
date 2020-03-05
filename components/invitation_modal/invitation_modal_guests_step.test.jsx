// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import InvitationModalGuestsStep from './invitation_modal_guests_step.jsx';

describe('components/invitation_modal/InvitationModalGuestsStep', () => {
    test('should match the snapshot', () => {
        const wrapper = shallow(
            <InvitationModalGuestsStep
                teamName='Test Team'
                currentTeamId='123'
                myInvitableChannels={[]}
                searchProfiles={jest.fn()}
                searchChannels={jest.fn()}
                emailInvitationsEnabled={true}
                onSubmit={jest.fn()}
                onEdit={jest.fn()}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot when email invitations are disabled', () => {
        const wrapper = shallow(
            <InvitationModalGuestsStep
                teamName='Test Team'
                currentTeamId='123'
                myInvitableChannels={[]}
                searchProfiles={jest.fn()}
                searchChannels={jest.fn()}
                emailInvitationsEnabled={false}
                onSubmit={jest.fn()}
                onEdit={jest.fn()}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});
