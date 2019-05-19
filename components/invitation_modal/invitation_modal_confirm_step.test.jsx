// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import InvitationModalConfirmStep from './invitation_modal_confirm_step.jsx';

describe('components/invitation_modal/InvitationModalConfirmStep', () => {
    test('should match the snapshot for guests', () => {
        const wrapper = shallow(
            <InvitationModalConfirmStep
                teamName='test'
                goBack={jest.fn()}
                onDone={jest.fn()}
                invitesType='guest'
                invitesSent={[{email: 'invite1@email'}, {email: 'invite2@email'}]}
                invitesNotSent={[{email: 'invite3@email'}, {email: 'invite4@email'}]}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot for members', () => {
        const wrapper = shallow(
            <InvitationModalConfirmStep
                teamName='test'
                goBack={jest.fn()}
                onDone={jest.fn()}
                invitesType='member'
                invitesSent={[{email: 'invite1@email'}, {email: 'invite2@email'}]}
                invitesNotSent={[{email: 'invite3@email'}, {email: 'invite4@email'}]}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot without successes', () => {
        const wrapper = shallow(
            <InvitationModalConfirmStep
                teamName='test'
                goBack={jest.fn()}
                onDone={jest.fn()}
                invitesType='member'
                invitesSent={[]}
                invitesNotSent={[{email: 'invite3@email'}, {email: 'invite4@email'}]}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot without failures', () => {
        const wrapper = shallow(
            <InvitationModalConfirmStep
                teamName='test'
                goBack={jest.fn()}
                onDone={jest.fn()}
                invitesType='member'
                invitesSent={[{email: 'invite1@email'}, {email: 'invite2@email'}]}
                invitesNotSent={[]}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});
