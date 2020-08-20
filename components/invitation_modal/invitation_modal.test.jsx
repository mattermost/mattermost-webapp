// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import configureStore from 'redux-mock-store';

import {Provider} from 'react-redux';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import InvitationModal from './invitation_modal.jsx';

describe('components/invitation_modal/InvitationModal', () => {
    const context = {router: {}};

    const mockStore = configureStore();

    const initialState = {
        entities: {
            teams: {
                currentTeamId: 'team_id1',
                teams: {
                    team_id1: {
                        id: 'team_id1',
                        name: 'team1',
                    },
                },
            },
            users: {
                currentUserId: 'current_user_id',
                profiles: {
                    current_user_id: {
                        id: 'current_user_id',
                        username: 'current_user',
                    },
                    user_id3: {id: 'user_id3', username: 'user3'},
                    user_id4: {id: 'user_id4', username: 'user4'},
                },
            },
        },
    };
    const store = mockStore(initialState);

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
        const wrapper = mountWithIntl(
            <Provider store={store}>
                <InvitationModal {...props}/>
            </Provider>,
        );

        wrapper.instance().goToMembers();

        expect(props.actions.getTeam).toHaveBeenCalledTimes(1);
        expect(props.actions.getTeam).toHaveBeenCalledWith(props.currentTeam.id);
    });
});
