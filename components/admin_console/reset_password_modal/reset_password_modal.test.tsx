// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {shallow} from 'enzyme';
import {UserNotifyProps, UserProfile} from 'mattermost-redux/types/users';
import {ActionResult} from 'mattermost-redux/types/actions';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import ResetPasswordModal from './reset_password_modal';

describe('components/admin_console/reset_password_modal/reset_password_modal.tsx', () => {
    const emptyFunction = jest.fn();
    const notifyProps: UserNotifyProps = {
        channel: 'true',
        comments: 'never',
        desktop: 'default',
        desktop_sound: 'true',
        email: 'true',
        first_name: 'true',
        mark_unread: 'all',
        mention_keys: '',
        push: 'default',
        push_status: 'ooo'
    };
    const user: UserProfile = {
        auth_data: '',
        auth_service: 'test',
        create_at: 0,
        delete_at: 0,
        email: '',
        email_verified: false,
        first_name: '',
        id: '1',
        is_bot: false,
        last_name: '',
        last_picture_update: 0,
        locale: '',
        nickname: '',
        notify_props: notifyProps,
        position: '',
        roles: '',
        terms_of_service_create_at: 0,
        terms_of_service_id: '',
        update_at: 0,
        username: '',
    };
    const baseProps = {
        actions: {updateUserPassword: jest.fn<ActionResult, {}[]>(() => ({data: ''}))},
        currentUserId: '1',
        user,
        show: true,
        onModalSubmit: emptyFunction,
        onModalDismissed: emptyFunction,
        passwordConfig: {
            minimumLength: 10,
            requireLowercase: true,
            requireNumber: true,
            requireSymbol: true,
            requireUppercase: true,
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <ResetPasswordModal {...baseProps}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when there is no user', () => {
        const props = {...baseProps, user: undefined};
        const wrapper = shallow(
            <ResetPasswordModal {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should call updateUserPassword', () => {
        const updateUserPassword = jest.fn<ActionResult, {}[]>(() => ({data: ''}));
        const oldPassword = 'oldPassword123!';
        const newPassword = 'newPassword123!';
        const props = {...baseProps, actions: {updateUserPassword}};
        const wrapper = mountWithIntl(<ResetPasswordModal {...props}/>);

        (wrapper.find('input[type=\'password\']').first().instance() as unknown as HTMLInputElement).value = oldPassword;
        (wrapper.find('input[type=\'password\']').last().instance() as unknown as HTMLInputElement).value = newPassword;
        wrapper.find('button[type=\'submit\']').first().simulate('click', {preventDefault: jest.fn()});

        expect(updateUserPassword.mock.calls.length).toBe(1);
        expect(wrapper.state('serverErrorCurrentPass')).toBeNull();
        expect(wrapper.state('serverErrorNewPass')).toBeNull();
    });

    test('should not call updateUserPassword when the old password is not provided', () => {
        const updateUserPassword = jest.fn<ActionResult, {}[]>(() => ({data: ''}));
        const newPassword = 'newPassword123!';
        const props = {...baseProps, actions: {updateUserPassword}};
        const wrapper = mountWithIntl(<ResetPasswordModal {...props}/>);

        (wrapper.find('input[type=\'password\']').last().instance() as unknown as HTMLInputElement).value = newPassword;
        wrapper.find('button[type=\'submit\']').first().simulate('click', {preventDefault: jest.fn()});

        expect(updateUserPassword.mock.calls.length).toBe(0);
        expect(wrapper.state('serverErrorCurrentPass')).toStrictEqual(
            <FormattedMessage
                defaultMessage='Please enter your current password.'
                id='admin.reset_password.missing_current'
                values={{}}
            />);
        expect(wrapper.state('serverErrorNewPass')).toBeNull();
    });

    test('should call updateUserPassword', () => {
        const updateUserPassword = jest.fn<ActionResult, {}[]>(() => ({data: ''}));
        const password = 'Password123!';

        const props = {...baseProps, currentUserId: '2', actions: {updateUserPassword}};
        const wrapper = mountWithIntl(<ResetPasswordModal {...props}/>);

        (wrapper.find('input[type=\'password\']').first().instance() as unknown as HTMLInputElement).value = password;
        wrapper.find('button[type=\'submit\']').first().simulate('click', {preventDefault: jest.fn()});

        expect(updateUserPassword.mock.calls.length).toBe(1);
    });
});
