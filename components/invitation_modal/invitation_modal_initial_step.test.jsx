// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import InvitationModalInitialStep from './invitation_modal_initial_step.jsx';

describe('components/invitation_modal/InvitationModalInitialStep', () => {
    test('should match the snapshot', () => {
        const wrapper = shallow(
            <InvitationModalInitialStep
                teamName='test'
                goToMembers={jest.fn()}
                goToGuests={jest.fn()}
                emailInvitationsEnabled={true}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot when email invitations are disabled', () => {
        const wrapper = shallow(
            <InvitationModalInitialStep
                teamName='test'
                goToMembers={jest.fn()}
                goToGuests={jest.fn()}
                emailInvitationsEnabled={false}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
