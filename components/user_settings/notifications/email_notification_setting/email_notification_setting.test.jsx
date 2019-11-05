// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {Preferences} from 'utils/constants';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';
import EmailNotificationSetting from 'components/user_settings/notifications/email_notification_setting/email_notification_setting.jsx';

describe('components/user_settings/notifications/EmailNotificationSetting', () => {
    const requiredProps = {
        currentUserId: 'current_user_id',
        activeSection: 'email',
        updateSection: jest.fn(),
        enableEmail: false,
        emailInterval: Preferences.INTERVAL_NEVER,
        onSubmit: jest.fn(),
        onCancel: jest.fn(),
        onChange: jest.fn(),
        serverError: '',
        saving: false,
        sendEmailNotifications: true,
        enableEmailBatching: false,
        siteName: 'Mattermost',
        actions: {
            savePreferences: jest.fn(),
        },
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
        expect(wrapper.state('newInterval')).toBe(Preferences.INTERVAL_IMMEDIATE);
        expect(requiredProps.onChange).toBeCalledTimes(1);
    });

    test('should pass handleSubmit', async () => {
        const newOnSubmit = jest.fn();
        const newUpdateSection = jest.fn();
        const newSavePreference = jest.fn();
        const props = {
            ...requiredProps,
            onSubmit: newOnSubmit,
            updateSection: newUpdateSection,
            actions: {savePreferences: newSavePreference},
        };

        const wrapper = mountWithIntl(<EmailNotificationSetting {...props}/>);

        await wrapper.instance().handleSubmit();
        expect(wrapper.state('newInterval')).toBe(Preferences.INTERVAL_NEVER);
        expect(newOnSubmit).not.toBeCalled();
        expect(newUpdateSection).toHaveBeenCalledTimes(1);
        expect(newUpdateSection).toBeCalledWith('');

        const newInterval = Preferences.INTERVAL_IMMEDIATE;
        wrapper.find('#emailNotificationImmediately').simulate('change');
        await wrapper.instance().handleSubmit();

        expect(wrapper.state('newInterval')).toBe(newInterval);
        expect(newOnSubmit).toBeCalled();
        expect(newOnSubmit).toHaveBeenCalledTimes(1);

        const expectedPref = [{
            category: 'notifications',
            name: 'email_interval',
            user_id: 'current_user_id',
            value: newInterval.toString(),
        }];

        expect(newSavePreference).toHaveBeenCalledTimes(1);
        expect(newSavePreference).toBeCalledWith('current_user_id', expectedPref);
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

    test('should derived state from props', () => {
        const nextProps = {
            emailInterval: Preferences.INTERVAL_IMMEDIATE,
            enableEmailBatching: true,
            sendEmailNotifications: true,
        };
        const wrapper = mountWithIntl(<EmailNotificationSetting {...requiredProps}/>);
        expect(wrapper.state('emailInterval')).toBe(requiredProps.emailInterval);
        expect(wrapper.state('enableEmailBatching')).toBe(requiredProps.enableEmailBatching);
        expect(wrapper.state('sendEmailNotifications')).toBe(requiredProps.sendEmailNotifications);
        expect(wrapper.state('newInterval')).toBe(Preferences.INTERVAL_NEVER);

        wrapper.setProps(nextProps);
        expect(wrapper.state('emailInterval')).toBe(nextProps.emailInterval);
        expect(wrapper.state('enableEmailBatching')).toBe(nextProps.enableEmailBatching);
        expect(wrapper.state('sendEmailNotifications')).toBe(nextProps.sendEmailNotifications);
        expect(wrapper.state('newInterval')).toBe(Preferences.INTERVAL_NEVER);

        nextProps.enableEmail = true;
        nextProps.emailInterval = Preferences.INTERVAL_FIFTEEN_MINUTES;
        wrapper.setProps(nextProps);
        expect(wrapper.state('emailInterval')).toBe(nextProps.emailInterval);
        expect(wrapper.state('enableEmailBatching')).toBe(nextProps.enableEmailBatching);
        expect(wrapper.state('sendEmailNotifications')).toBe(nextProps.sendEmailNotifications);
        expect(wrapper.state('newInterval')).toBe(Preferences.INTERVAL_FIFTEEN_MINUTES);
    });
});
