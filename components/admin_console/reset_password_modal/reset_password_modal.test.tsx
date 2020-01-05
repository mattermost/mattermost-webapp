// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {shallow} from 'enzyme';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import ResetPasswordModal from './reset_password_modal';

describe('components/admin_console/reset_password_modal/reset_password_modal.tsx', () => {
    const emptyFunction = jest.fn();
    const baseProps = {
        actions: {adminResetPassword: jest.fn(() => {})},
        currentUserId: '1',
        user: {id: '1', auth_service: 'test'},
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
        const props = {...baseProps, user: null};
        const wrapper = shallow(
            <ResetPasswordModal {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should call adminResetPassword', () => {
        const adminResetPassword = jest.fn(() => {});
        const oldPassword = 'oldPassword123!';
        const newPassword = 'newPassword123!';
        const props = {...baseProps, actions: {adminResetPassword}};
        const wrapper = mountWithIntl(<ResetPasswordModal {...props}/>);

        (wrapper.find('input[type=\'password\']').first().instance() as unknown as HTMLInputElement).value = oldPassword;
        (wrapper.find('input[type=\'password\']').last().instance() as unknown as HTMLInputElement).value = newPassword;
        wrapper.find('button[type=\'submit\']').first().simulate('click', {preventDefault: jest.fn()});

        expect(adminResetPassword.mock.calls.length).toBe(1);
        expect(wrapper.state('serverErrorCurrentPass')).toBeNull();
        expect(wrapper.state('serverErrorNewPass')).toBeNull();
    });

    test('should not call adminResetPassword when the old password is not provided', () => {
        const adminResetPassword = jest.fn(() => {});
        const newPassword = 'newPassword123!';
        const props = {...baseProps, actions: {adminResetPassword}};
        const wrapper = mountWithIntl(<ResetPasswordModal {...props}/>);

        (wrapper.find('input[type=\'password\']').last().instance() as unknown as HTMLInputElement).value = newPassword;
        wrapper.find('button[type=\'submit\']').first().simulate('click', {preventDefault: jest.fn()});

        expect(adminResetPassword.mock.calls.length).toBe(0);
        expect(wrapper.state('serverErrorCurrentPass')).toStrictEqual(
            <FormattedMessage
                defaultMessage='Please enter your current password.'
                id='admin.reset_password.missing_current'
                values={{}}
            />);
        expect(wrapper.state('serverErrorNewPass')).toBeNull();
    });

    test('should call adminResetPassword', () => {
        const adminResetPassword = jest.fn(() => {});
        const password = 'Password123!';

        const props = {...baseProps, currentUserId: '2', actions: {adminResetPassword}};
        const wrapper = mountWithIntl(<ResetPasswordModal {...props}/>);

        (wrapper.find('input[type=\'password\']').first().instance() as unknown as HTMLInputElement).value = password;
        wrapper.find('button[type=\'submit\']').first().simulate('click', {preventDefault: jest.fn()});

        expect(adminResetPassword.mock.calls.length).toBe(1);
    });
});
