// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {shallow} from 'enzyme';

import {UserProfile} from 'mattermost-redux/types/users';
import {ActionResult} from 'mattermost-redux/types/actions';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';
import {TestHelper} from 'utils/test_helper';

import ResetEmailModal from './reset_email_modal';

describe('components/admin_console/reset_password_modal/reset_password_modal.tsx', () => {
    const emptyFunction = jest.fn();

    const user: UserProfile = TestHelper.getUserMock({
        email: 'arvin.darmawan@gmail.com',
    });

    const baseProps = {
        // eslint-disable-next-line @typescript-eslint/ban-types
        actions: {patchUser: jest.fn<ActionResult, Array<{}>>(() => ({data: ''}))},
        user,
        show: false,
        onModalSubmit: emptyFunction,
        onModalDismissed: emptyFunction,
    };

    test('should match snapshot', () => {
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
        // eslint-disable-next-line @typescript-eslint/ban-types
        const patchUser = jest.fn<ActionResult, Array<{}>>(() => ({data: ''}));
        const props = {...baseProps, email: '', actions: {patchUser}};
        const wrapper = mountWithIntl(<ResetEmailModal {...props}/>);

        wrapper.find('button[type=\'submit\']').first().simulate('click', {preventDefault: jest.fn()});

        expect(patchUser.mock.calls.length).toBe(0);
        expect(wrapper.state('serverErrorCurrentPass')).toStrictEqual(
            <FormattedMessage
                id='user.settings.general.validEmail'
                defaultMessage='Please enter a valid email address.'
            />);
        expect(wrapper.state('serverErrorNewPass')).toBeNull();
    });

    test('should not update email since the email is invalid', () => {
        // eslint-disable-next-line @typescript-eslint/ban-types
        const patchUser = jest.fn<ActionResult, Array<{}>>(() => ({data: ''}));
        const props = {...baseProps, email: 'arvinnow', actions: {patchUser}};
        const wrapper = mountWithIntl(<ResetEmailModal {...props}/>);

        wrapper.find('button[type=\'submit\']').first().simulate('click', {preventDefault: jest.fn()});

        expect(patchUser.mock.calls.length).toBe(0);
        expect(wrapper.state('serverErrorCurrentPass')).toStrictEqual(
            <FormattedMessage
                id='user.settings.general.validEmail'
                defaultMessage='Please enter a valid email address.'
            />);
        expect(wrapper.state('serverErrorNewPass')).toBeNull();
    });

    test('should update email since the email is valid', () => {
        // eslint-disable-next-line @typescript-eslint/ban-types
        const patchUser = jest.fn<ActionResult, Array<{}>>(() => ({data: ''}));
        const props = {...baseProps, email: 'arvin.darmawan@gmail.com', actions: {patchUser}};
        const wrapper = mountWithIntl(<ResetEmailModal {...props}/>);

        wrapper.find('button[type=\'submit\']').first().simulate('click', {preventDefault: jest.fn()});

        expect(patchUser.mock.calls.length).toBe(1);
        expect(wrapper.state('serverErrorCurrentPass')).toBeNull();
        expect(wrapper.state('serverErrorNewPass')).toBeNull();
    });
});
