// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {savePreference} from 'actions/user_actions.jsx';
import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';
import EmailNotificationSetting from 'components/user_settings/notifications/email_notification_setting.jsx';

jest.mock('actions/user_actions.jsx', () => ({
    savePreference: jest.fn(),
}));

describe('components/user_settings/notifications/EmailNotificationSetting', () => {
    const requiredProps = {
        activeSection: 'email',
        updateSection: jest.fn(),
        enableEmail: false,
        emailInterval: 0,
        onSubmit: jest.fn(),
        onCancel: jest.fn(),
        serverError: '',
        saving: false,
        sendEmailNotifications: true,
        enableEmailBatching: false,
        siteName: 'Mattermost',
    };

    test('should match snapshot', () => {
        const wrapper = mountWithIntl(<EmailNotificationSetting {...requiredProps}/>);

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('#emailNotificationImmediately').exists()).toBe(true);
        expect(wrapper.find('#emailNotificationNever').exists()).toBe(true);
        expect(wrapper.find('#emailNotificationMinutes').exists()).toBe(false);
        expect(wrapper.find('#emailNotificationHour').exists()).toBe(false);
    });

    test('should match snapshot, enabled email batching', () => {
        const props = {
            ...requiredProps,
            enableEmailBatching: true,
        };
        const wrapper = mountWithIntl(<EmailNotificationSetting {...props}/>);

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('#emailNotificationMinutes').exists()).toBe(true);
        expect(wrapper.find('#emailNotificationHour').exists()).toBe(true);
    });

    test('should match snapshot, not send email notifications', () => {
        const props = {
            ...requiredProps,
            sendEmailNotifications: false,
        };
        const wrapper = shallow(<EmailNotificationSetting {...props}/>);

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, active section != email and SendEmailNotifications !== true', () => {
        const props = {
            ...requiredProps,
            sendEmailNotifications: false,
            activeSection: '',
        };
        const wrapper = shallow(<EmailNotificationSetting {...props}/>);

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, active section != email and SendEmailNotifications = true', () => {
        const props = {
            ...requiredProps,
            sendEmailNotifications: true,
            activeSection: '',
        };
        const wrapper = shallow(<EmailNotificationSetting {...props}/>);

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, active section != email, SendEmailNotifications = true and enableEmail = true', () => {
        const props = {
            ...requiredProps,
            sendEmailNotifications: true,
            activeSection: '',
            enableEmail: true,
        };
        const wrapper = shallow(<EmailNotificationSetting {...props}/>);

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on serverError', () => {
        const newServerError = 'serverError';
        const props = {...requiredProps, serverError: newServerError};
        const wrapper = shallow(<EmailNotificationSetting {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should pass handleChange', () => {
        const wrapper = mountWithIntl(<EmailNotificationSetting {...requiredProps}/>);
        wrapper.find('#emailNotificationImmediately').simulate('change');

        expect(wrapper.state('enableEmail')).toBe('true');
        expect(wrapper.state('emailInterval')).toBe(30);
    });

    test('should pass handleSubmit', () => {
        const newOnSubmit = jest.fn();
        const newUpdateSection = jest.fn();
        const props = {...requiredProps, onSubmit: newOnSubmit, updateSection: newUpdateSection};
        const wrapper = mountWithIntl(<EmailNotificationSetting {...props}/>);

        wrapper.instance().handleSubmit();

        expect(newOnSubmit).not.toBeCalled();
        expect(newUpdateSection).toHaveBeenCalledTimes(1);
        expect(newUpdateSection).toBeCalledWith('');

        wrapper.find('#emailNotificationNever').simulate('change');
        wrapper.instance().handleSubmit();

        expect(newOnSubmit).toBeCalled();
        expect(newOnSubmit).toHaveBeenCalledTimes(1);
        expect(newOnSubmit).toBeCalledWith('false');

        expect(savePreference).toHaveBeenCalledTimes(1);
        expect(savePreference).toBeCalledWith('notifications', 'email_interval', '0');
    });

    test('should pass handleUpdateSection', () => {
        const newUpdateSection = jest.fn();
        const newOnCancel = jest.fn();
        const props = {...requiredProps, updateSection: newUpdateSection, onCancel: newOnCancel};
        const wrapper = mountWithIntl(<EmailNotificationSetting {...props}/>);

        wrapper.instance().handleUpdateSection('email');
        expect(newUpdateSection).toBeCalledWith('email');
        expect(newUpdateSection).toHaveBeenCalledTimes(1);
        expect(newOnCancel).not.toBeCalled();

        wrapper.instance().handleUpdateSection();
        expect(newUpdateSection).toBeCalled();
        expect(newUpdateSection).toHaveBeenCalledTimes(2);
        expect(newUpdateSection).toBeCalledWith('');
        expect(newOnCancel).toBeCalled();
    });

    test('should pass componentWillReceiveProps', () => {
        const nextProps = {
            enableEmail: true,
            emailInterval: 30,
        };
        const wrapper = mountWithIntl(<EmailNotificationSetting {...requiredProps}/>);
        wrapper.setProps(nextProps);

        expect(wrapper.state('enableEmail')).toBe(nextProps.enableEmail);
        expect(wrapper.state('emailInterval')).toBe(nextProps.emailInterval);
    });
});
