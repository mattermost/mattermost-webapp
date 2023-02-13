// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {shallow} from 'enzyme';

import {UserProfile} from '@mattermost/types/users';
import {ActionResult} from 'mattermost-redux/types/actions';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import {TestHelper} from 'utils/test_helper';

import ResetEmailModal from './reset_email_modal';

describe('components/admin_console/reset_email_modal/reset_email_modal.tsx', () => {
    const emptyFunction = jest.fn();

    const user: UserProfile = TestHelper.getUserMock({
        email: 'arvin.darmawan@gmail.com',
    });

    const baseProps = {
        // eslint-disable-next-line @typescript-eslint/ban-types
        actions: {patchUser: jest.fn<ActionResult, Array<{}>>(() => ({data: ''}))},
        user,
        currentUserId: 'random_user_id',
        show: true,
        onModalSubmit: emptyFunction,
        onModalDismissed: emptyFunction,
    };

    test('should match snapshot when the same user', () => {
        const wrapper = shallow(
            <ResetEmailModal
                {...baseProps}
                currentUserId={user.id}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when not the same user', () => {
        const wrapper = shallow(
            <ResetEmailModal {...baseProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when there is no user', () => {
        const props = {...baseProps, user: undefined};
        const wrapper = shallow(
            <ResetEmailModal {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should not update email since the email is empty', () => {
        const patchUser = jest.fn(() => ({data: ''}));
        const props = {...baseProps, actions: {patchUser}};
        const wrapper = mountWithIntl(<ResetEmailModal {...props}/>);

        (wrapper.find('input[type=\'email\']').first().instance() as unknown as HTMLInputElement).value = '';
        wrapper.find('button[type=\'submit\']').first().simulate('click', {preventDefault: jest.fn()});

        expect(patchUser.mock.calls.length).toBe(0);
        expect(wrapper.state('error')).toStrictEqual(
            <FormattedMessage
                id='user.settings.general.validEmail'
                defaultMessage='Please enter a valid email address.'
            />);
    });

    test('should not update email since the email is invalid', () => {
        const patchUser = jest.fn(() => ({data: ''}));
        const email = 'arvinnow';
        const props = {...baseProps, actions: {patchUser}};
        const wrapper = mountWithIntl(<ResetEmailModal {...props}/>);

        (wrapper.find('input[type=\'email\']').first().instance() as unknown as HTMLInputElement).value = email;
        wrapper.find('button[type=\'submit\']').first().simulate('click', {preventDefault: jest.fn()});

        expect(patchUser.mock.calls.length).toBe(0);
        expect(wrapper.state('error')).toStrictEqual(
            <FormattedMessage
                id='user.settings.general.validEmail'
                defaultMessage='Please enter a valid email address.'
            />);
    });

    test('should update email since the email is valid', () => {
        const patchUser = jest.fn(() => ({data: ''}));
        const email = 'arvin.darmawan@gmail.com';
        const props = {...baseProps, actions: {patchUser}};
        const wrapper = mountWithIntl(<ResetEmailModal {...props}/>);

        (wrapper.find('input[type=\'email\']').first().instance() as unknown as HTMLInputElement).value = email;
        wrapper.find('button[type=\'submit\']').first().simulate('click', {preventDefault: jest.fn()});

        expect(patchUser.mock.calls.length).toBe(1);
        expect(wrapper.state('error')).toBeNull();
    });
});
