// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import InvitationModalMembersStep from './invitation_modal_members_step.jsx';

describe('components/invitation_modal/InvitationModalMembersStep', () => {
    test('should match the snapshot', () => {
        const wrapper = shallowWithIntl(
            <InvitationModalMembersStep
                teamName='Test Team'
                currentTeamId='test-team-id'
                inviteId='123'
                searchProfiles={jest.fn()}
                emailInvitationsEnabled={true}
                onSubmit={jest.fn()}
                onEdit={jest.fn()}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot when email invitations are disabled', () => {
        const wrapper = shallowWithIntl(
            <InvitationModalMembersStep
                teamName='Test Team'
                currentTeamId='test-team-id'
                inviteId='123'
                searchProfiles={jest.fn()}
                emailInvitationsEnabled={false}
                onSubmit={jest.fn()}
                onEdit={jest.fn()}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should send not_in_team_id when search profiles is called', async () => {
        const searchProfiles = jest.fn().mockImplementation(() => {
            const data = [];

            return Promise.resolve({data});
        });

        const wrapper = shallowWithIntl(
            <InvitationModalMembersStep
                teamName='Test Team'
                currentTeamId='test-team-id'
                inviteId='123'
                searchProfiles={searchProfiles}
                emailInvitationsEnabled={false}
                onSubmit={jest.fn()}
                onEdit={jest.fn()}
            />
        );

        wrapper.instance().usersLoader('@something', jest.fn());
        jest.runAllTimers();
        expect(searchProfiles).toHaveBeenCalledWith('@something', {not_in_team_id: 'test-team-id'});
    });
});
