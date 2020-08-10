// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {TestHelper} from 'utils/test_helper';

import InviteMembersStep from './invite_members_step';

describe('components/next_steps_view/steps/invite_members_step', () => {
    const baseProps = {
        id: 'invite_members_step',
        onSkip: jest.fn(),
        onFinish: jest.fn(),
        currentUser: TestHelper.getUserMock(),
        maxFileSize: 1000000000,
        actions: {
            updateMe: jest.fn(),
            setDefaultProfileImage: jest.fn(),
            uploadProfileImage: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <InviteMembersStep {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
