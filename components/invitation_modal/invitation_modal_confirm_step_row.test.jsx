// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import InvitationModalConfirmStepRow from './invitation_modal_confirm_step_row.jsx';

describe('components/invitation_modal/InvitationModalConfirmStepRow', () => {
    test('should match the snapshot for email invitation', () => {
        const wrapper = shallow(
            <InvitationModalConfirmStepRow
                invitation={{email: 'test-email@test.com', reason: 'Test reason email'}}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot for user invitation', () => {
        const wrapper = shallow(
            <InvitationModalConfirmStepRow
                invitation={{
                    user: {
                        id: 'test-id',
                        username: 'test',
                        nickname: 'test-nickname',
                        first_name: 'first-name',
                        last_name: 'last-name',
                    },
                    reason: 'Test reason user',
                }}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot for guest addition to channel', () => {
        const wrapper = shallow(
            <InvitationModalConfirmStepRow
                invitation={{
                    user: {
                        id: 'test-id',
                        username: 'test',
                        nickname: 'test-nickname',
                        first_name: 'first-name',
                        last_name: 'last-name',
                    },
                    reason: {
                        id: 'some-id',
                        message: 'some message',
                        values: {count: 1},
                    },
                }}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match the snapshot for text failure', () => {
        const wrapper = shallow(
            <InvitationModalConfirmStepRow
                invitation={{
                    text: 'test',
                    reason: 'Test reason for text',
                }}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
