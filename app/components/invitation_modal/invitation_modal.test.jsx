// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import InvitationModal from './invitation_modal.jsx';

describe('components/invitation_modal/InvitationModal', () => {
    const context = {router: {}};

    const defaultProps = {
        show: true,
        currentTeam: {
            id: 'test',
            display_name: 'Test name',
            invite_id: 'test-invite-id',
        },
        invitableChannels: [],
        canInviteGuests: true,
        canAddUsers: true,
        emailInvitationsEnabled: true,
        isCloud: false,
        actions: {
            closeModal: jest.fn(),
            sendGuestsInvites: jest.fn(),
            sendMembersInvites: jest.fn(),
            searchProfiles: jest.fn(),
            searchChannels: jest.fn(),
            getTeam: jest.fn(),
        },
    };

    test('should match the snapshot', () => {
        const wrapper = shallow(
            <InvitationModal {...defaultProps}/>,
            {context},
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot when not show', () => {
        const wrapper = shallow(
            <InvitationModal
                {...defaultProps}
                show={false}
            />,
            {context},
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot when I have no permission to add users', () => {
        const wrapper = shallow(
            <InvitationModal
                {...defaultProps}
                canAddUsers={false}
            />,
            {context},
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot when I have no permission to invite guests', () => {
        const wrapper = shallow(
            <InvitationModal
                {...defaultProps}
                canInviteGuests={false}
            />,
            {context},
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should call actions.getTeam if invite_id is empty', () => {
        const props = {...defaultProps};
        props.currentTeam.invite_id = '';
        const wrapper = shallow(
            <InvitationModal {...props}/>,
            {context},
        );
        wrapper.instance().goToMembers();

        expect(props.actions.getTeam).toHaveBeenCalledTimes(1);
        expect(props.actions.getTeam).toHaveBeenCalledWith(props.currentTeam.id);
    });

    test('should work properly with full inside (and with the reference to the modal)', () => {
        const props = {...defaultProps};
        props.currentTeam.invite_id = '';
        const wrapper = shallow(
            <InvitationModal {...props}/>,
        );

        wrapper.instance().goToMembers();

        expect(props.actions.getTeam).toHaveBeenCalledTimes(1);
        expect(props.actions.getTeam).toHaveBeenCalledWith(props.currentTeam.id);
    });
});
