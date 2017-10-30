// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {savePreference} from 'actions/user_actions.jsx';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import EmailNotificationSetting from 'components/user_settings/email_notification_setting.jsx';

jest.mock('actions/user_actions.jsx', () => ({
    savePreference: jest.fn()
}));

describe('components/user_settings/EmailNotificationSetting', () => {
    const activeSection = 'email';
    const updateSection = jest.fn();
    const enableEmail = false;
    const emailInterval = 0;
    const onSubmit = jest.fn();
    const onCancel = jest.fn();
    const serverError = '';
    const saving = false;

    const requiredProps = {
        activeSection,
        updateSection,
        enableEmail,
        emailInterval,
        onSubmit,
        onCancel,
        serverError,
        saving
    };

    global.window.mm_config = {};

    afterEach(() => {
        global.window.mm_config = {};
    });

    beforeEach(() => {
        global.window.mm_config.SendEmailNotifications = 'true';
        global.window.mm_config.EnableEmailBatching = 'false';
        global.window.mm_config.SiteName = 'Mattermost';
    });

    test('should match snapshot', () => {
        const wrapper = mountWithIntl(<EmailNotificationSetting {...requiredProps}/>);

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('#emailNotificationImmediately').exists()).toBe(true);
        expect(wrapper.find('#emailNotificationNever').exists()).toBe(true);
        expect(wrapper.find('#emailNotificationMinutes').exists()).toBe(false);
        expect(wrapper.find('#emailNotificationHour').exists()).toBe(false);
    });

    test('should match snapshot, enabled email batching', () => {
        global.window.mm_config.EnableEmailBatching = 'true';
        const wrapper = mountWithIntl(<EmailNotificationSetting {...requiredProps}/>);

        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find('#emailNotificationMinutes').exists()).toBe(true);
        expect(wrapper.find('#emailNotificationHour').exists()).toBe(true);
    });

    test('should match snapshot, not send email notifications', () => {
        global.window.mm_config.SendEmailNotifications = 'false';
        const wrapper = shallow(<EmailNotificationSetting {...requiredProps}/>);

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, active section != email and SendEmailNotifications !== true', () => {
        global.window.mm_config.SendEmailNotifications = 'false';
        const newActiveSection = '';
        const props = {...requiredProps, activeSection: newActiveSection};
        const wrapper = shallow(<EmailNotificationSetting {...props}/>);

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, active section != email and SendEmailNotifications = true', () => {
        global.window.mm_config.SendEmailNotifications = 'true';
        const newActiveSection = '';
        const props = {...requiredProps, activeSection: newActiveSection};
        const wrapper = shallow(<EmailNotificationSetting {...props}/>);

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, active section != email, SendEmailNotifications = true and enableEmail = true', () => {
        global.window.mm_config.SendEmailNotifications = 'true';
        const newActiveSection = '';
        const newEnableEmail = true;
        const props = {...requiredProps, activeSection: newActiveSection, enableEmail: newEnableEmail};
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
        expect(newOnSubmit).toBeCalledWith({enableEmail: 'false'});

        expect(savePreference).toHaveBeenCalledTimes(1);
        expect(savePreference).toBeCalledWith('notifications', 'email_interval', '0');
    });

    test('should pass handleExpand', () => {
        const newUpdateSection = jest.fn();
        const props = {...requiredProps, updateSection: newUpdateSection};
        const wrapper = mountWithIntl(<EmailNotificationSetting {...props}/>);

        wrapper.instance().handleExpand();

        expect(newUpdateSection).toBeCalled();
        expect(newUpdateSection).toHaveBeenCalledTimes(1);
        expect(newUpdateSection).toBeCalledWith('email');
    });

    test('should pass handleCancel', () => {
        const newOnCancel = jest.fn();
        const props = {...requiredProps, onCancel: newOnCancel};
        const evt = {preventDefault: jest.fn()};
        const wrapper = mountWithIntl(<EmailNotificationSetting {...props}/>);

        wrapper.instance().handleCancel(evt);

        expect(newOnCancel).toBeCalled();
        expect(newOnCancel).toHaveBeenCalledTimes(1);
        expect(newOnCancel).toBeCalledWith(evt);
    });

    test('should pass componentWillReceiveProps', () => {
        const nextProps = {
            enableEmail: true,
            emailInterval: 30
        };
        const wrapper = mountWithIntl(<EmailNotificationSetting {...requiredProps}/>);
        wrapper.setProps(nextProps);

        expect(wrapper.state('enableEmail')).toBe(nextProps.enableEmail);
        expect(wrapper.state('emailInterval')).toBe(nextProps.emailInterval);
    });
});
