// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import InvitationModalMembersStep from './invitation_modal_members_step.jsx';

describe('components/invitation_modal/InvitationModalMembersStep', () => {
    test('should match the snapshot', () => {
        const wrapper = shallow(
            <InvitationModalMembersStep
                inviteId='123'
                searchProfiles={jest.fn()}
                goBack={jest.fn()}
                onSubmit={jest.fn()}
                onEdit={jest.fn()}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });
});
