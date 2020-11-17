// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {NotificationLevels} from 'utils/constants';

import DesktopNotificationSettings from 'components/user_settings/notifications/desktop_notification_settings';

jest.mock('utils/utils.jsx', () => {
    const original = jest.requireActual('utils/utils.jsx');
    return {
        ...original,
        hasSoundOptions: jest.fn(() => true),
    };
});

describe('components/user_settings/notifications/DesktopNotificationSettings', () => {
    function emptyFunction() {} //eslint-disable-line no-empty-function

    const baseProps = {
        activity: NotificationLevels.MENTION,
        sound: 'false',
        updateSection: emptyFunction,
        setParentState: emptyFunction,
        submit: emptyFunction,
        cancel: emptyFunction,
        error: '',
        active: true,
        saving: false,
        focused: false,
        selectedSound: 'Bing',
    };

    test('should match snapshot, on max setting', () => {
        const wrapper = shallow(
            <DesktopNotificationSettings {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on max setting with sound enabled', () => {
        const props = {...baseProps, sound: 'true'};
        const wrapper = shallow(
            <DesktopNotificationSettings {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, on min setting', () => {
        const props = {...baseProps, active: false};
        const wrapper = shallow(
            <DesktopNotificationSettings {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should call props.updateSection and props.cancel on handleMinUpdateSection', () => {
        const props = {...baseProps, updateSection: jest.fn(), cancel: jest.fn()};
        const wrapper = shallow(
            <DesktopNotificationSettings {...props}/>,
        );

        wrapper.instance().handleMinUpdateSection('');
        expect(props.updateSection).toHaveBeenCalledTimes(1);
        expect(props.updateSection).toHaveBeenCalledWith('');
        expect(props.cancel).toHaveBeenCalledTimes(1);
        expect(props.cancel).toHaveBeenCalledWith();

        wrapper.instance().handleMinUpdateSection('desktop');
        expect(props.updateSection).toHaveBeenCalledTimes(2);
        expect(props.updateSection).toHaveBeenCalledWith('desktop');
        expect(props.cancel).toHaveBeenCalledTimes(2);
        expect(props.cancel).toHaveBeenCalledWith();
    });

    test('should call props.updateSection on handleMaxUpdateSection', () => {
        const props = {...baseProps, updateSection: jest.fn()};
        const wrapper = shallow(
            <DesktopNotificationSettings {...props}/>,
        );

        wrapper.instance().handleMaxUpdateSection('');
        expect(props.updateSection).toHaveBeenCalledTimes(1);
        expect(props.updateSection).toHaveBeenCalledWith('');

        wrapper.instance().handleMaxUpdateSection('desktop');
        expect(props.updateSection).toHaveBeenCalledTimes(2);
        expect(props.updateSection).toHaveBeenCalledWith('desktop');
    });

    test('should call props.setParentState on handleOnChange', () => {
        const props = {...baseProps, setParentState: jest.fn()};
        const wrapper = shallow(
            <DesktopNotificationSettings {...props}/>,
        );

        wrapper.instance().handleOnChange({
            currentTarget: {getAttribute: (key) => {
                return {'data-key': 'dataKey', 'data-value': 'dataValue'}[key];
            }},
        });

        expect(props.setParentState).toHaveBeenCalledTimes(1);
        expect(props.setParentState).toHaveBeenCalledWith('dataKey', 'dataValue');
    });

    test('should match snapshot, on buildMaximizedSetting', () => {
        const wrapper = shallow(
            <DesktopNotificationSettings {...baseProps}/>,
        );

        expect(wrapper.instance().buildMaximizedSetting()).toMatchSnapshot();

        wrapper.setProps({activity: NotificationLevels.NONE});
        expect(wrapper.instance().buildMaximizedSetting()).toMatchSnapshot();
    });

    test('should match snapshot, on buildMinimizedSetting', () => {
        const wrapper = shallow(
            <DesktopNotificationSettings {...baseProps}/>,
        );

        expect(wrapper.instance().buildMinimizedSetting()).toMatchSnapshot();

        wrapper.setProps({activity: NotificationLevels.NONE});
        expect(wrapper.instance().buildMinimizedSetting()).toMatchSnapshot();
    });
});
