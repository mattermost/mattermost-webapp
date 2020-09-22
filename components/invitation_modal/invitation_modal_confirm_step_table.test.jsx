// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import InvitationModalConfirmStepTable from './invitation_modal_confirm_step_table.jsx';

describe('components/invitation_modal/InvitationModalConfirmStepTable', () => {
    test('should match the snapshot', () => {
        const wrapper = shallow(
            <InvitationModalConfirmStepTable
                invites={[{email: 'test-email@test.com'}, {user: {id: 'test-id', username: 'test'}}]}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
