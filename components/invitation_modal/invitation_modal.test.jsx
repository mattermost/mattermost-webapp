// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {IntlProvider} from 'react-intl';
import {shallow} from 'enzyme';

import InvitationModal from './invitation_modal.jsx';

describe('components/invitation_modal/InvitationModal', () => {
    const intlProvider = new IntlProvider({locale: 'en', defaultLocale: 'en'}, {});
    const {intl} = intlProvider.getChildContext();
    const context = {router: {}, intl};

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
        actions: {
            closeModal: jest.fn(),
            sendGuestsInvites: jest.fn(),
            sendMembersInvites: jest.fn(),
            searchProfiles: jest.fn(),
        },
    };

    test('should match the snapshot', () => {
        const wrapper = shallow(
            <InvitationModal {...defaultProps}/>,
            {context}
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot when not show', () => {
        const wrapper = shallow(
            <InvitationModal
                {...defaultProps}
                show={false}
            />,
            {context}
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot when I have no permission to add users', () => {
        const wrapper = shallow(
            <InvitationModal
                {...defaultProps}
                canAddUsers={false}
            />,
            {context}
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot when I have no permission to invite guests', () => {
        const wrapper = shallow(
            <InvitationModal
                {...defaultProps}
                canInviteGuests={false}
            />,
            {context}
        );
        expect(wrapper).toMatchSnapshot();
    });
});
