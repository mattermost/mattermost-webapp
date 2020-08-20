// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallow} from 'enzyme';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import InvitationModalMembersStep from './invitation_modal_members_step';

describe('components/invitation_modal/InvitationModalMembersStep', () => {
    test('should match the snapshot', () => {
        const wrapper = shallow(
            <InvitationModalMembersStep
                teamName='Test Team'
                currentTeamId='test-team-id'
                inviteId='123'
                searchProfiles={jest.fn()}
                emailInvitationsEnabled={true}
                onSubmit={jest.fn()}
                onEdit={jest.fn()}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot when email invitations are disabled', () => {
        const wrapper = shallow(
            <InvitationModalMembersStep
                teamName='Test Team'
                currentTeamId='test-team-id'
                inviteId='123'
                searchProfiles={jest.fn()}
                emailInvitationsEnabled={false}
                onSubmit={jest.fn()}
                onEdit={jest.fn()}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
