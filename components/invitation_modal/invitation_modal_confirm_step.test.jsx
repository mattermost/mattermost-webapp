// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {InviteTypes} from 'utils/constants';

import InvitationModalConfirmStep from './invitation_modal_confirm_step.jsx';

describe('components/invitation_modal/InvitationModalConfirmStep', () => {
    test('should match the snapshot for guests with failures and successes', () => {
        const wrapper = shallow(
            <InvitationModalConfirmStep
                teamName='test'
                onDone={jest.fn()}
                onInviteMore={jest.fn()}
                invitesType={InviteTypes.INVITE_GUEST}
                invitesSent={[{email: 'invite1@email'}, {email: 'invite2@email'}]}
                invitesNotSent={[{email: 'invite3@email'}, {email: 'invite4@email'}]}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot for members with failures and successes', () => {
        const wrapper = shallow(
            <InvitationModalConfirmStep
                teamName='test'
                onDone={jest.fn()}
                onInviteMore={jest.fn()}
                invitesType={InviteTypes.INVITE_MEMBER}
                invitesSent={[{email: 'invite1@email'}, {email: 'invite2@email'}]}
                invitesNotSent={[{email: 'invite3@email'}, {email: 'invite4@email'}]}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot without successes', () => {
        const wrapper = shallow(
            <InvitationModalConfirmStep
                teamName='test'
                onDone={jest.fn()}
                onInviteMore={jest.fn()}
                invitesType={InviteTypes.INVITE_MEMBER}
                invitesSent={[]}
                invitesNotSent={[{email: 'invite3@email'}, {email: 'invite4@email'}]}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot without failures', () => {
        const wrapper = shallow(
            <InvitationModalConfirmStep
                teamName='test'
                onDone={jest.fn()}
                onInviteMore={jest.fn()}
                invitesType={InviteTypes.INVITE_MEMBER}
                invitesSent={[{email: 'invite1@email'}, {email: 'invite2@email'}]}
                invitesNotSent={[]}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot without failures or successes', () => {
        const wrapper = shallow(
            <InvitationModalConfirmStep
                teamName='test'
                onDone={jest.fn()}
                onInviteMore={jest.fn()}
                invitesType={InviteTypes.INVITE_MEMBER}
                invitesSent={[]}
                invitesNotSent={[]}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
