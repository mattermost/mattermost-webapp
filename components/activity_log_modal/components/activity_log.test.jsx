// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {FormattedMessage} from 'react-intl';

import {General} from 'mattermost-redux/constants';

import {localizeMessage} from 'utils/utils.jsx';
import ActivityLog from 'components/activity_log_modal/components/activity_log.jsx';

describe('components/activity_log_modal/ActivityLog', () => {
    const baseProps = {
        index: 0,
        locale: General.DEFAULT_LOCALE,
        currentSession: {
            props: {os: 'Linux', platform: 'Linux', browser: 'Desktop App'},
            id: 'sessionId',
            create_at: 1534917291042,
            last_activity_at: 1534917643890,
        },
        submitRevoke: jest.fn(),
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <ActivityLog {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('submitRevoke is called correctly', () => {
        const wrapper = shallow(
            <ActivityLog {...baseProps}/>,
        );

        wrapper.instance().submitRevoke('e');
        expect(baseProps.submitRevoke).toBeCalled();
        expect(baseProps.submitRevoke).toHaveBeenCalledTimes(1);
        expect(baseProps.submitRevoke).toBeCalledWith('sessionId', 'e');
    });

    test('handleMoreInfo updates state correctly', () => {
        const wrapper = shallow(
            <ActivityLog {...baseProps}/>,
        );

        wrapper.instance().handleMoreInfo();
        expect(wrapper.state()).toEqual({moreInfo: true});
    });

    test('should match when isMobileSession is called', () => {
        const wrapper = shallow(
            <ActivityLog {...baseProps}/>,
        );

        const isMobileSession = wrapper.instance().isMobileSession;
        expect(isMobileSession({device_id: 'apple'})).toEqual(true);
        expect(isMobileSession({device_id: 'android'})).toEqual(true);
        expect(isMobileSession({device_id: 'none'})).toEqual(false);
    });

    test('should match when mobileSessionInfo is called', () => {
        const wrapper = shallow(
            <ActivityLog {...baseProps}/>,
        );

        const mobileSessionInfo = wrapper.instance().mobileSessionInfo;

        const appleText = (
            <FormattedMessage
                defaultMessage='iPhone Native Classic App'
                id='activity_log_modal.iphoneNativeClassicApp'
                values={{}}
            />
        );
        const apple = {devicePicture: 'fa fa-apple', deviceTitle: localizeMessage('device_icons.apple', 'Apple Icon'), devicePlatform: appleText};
        expect(mobileSessionInfo({device_id: 'apple'})).toEqual(apple);

        const androidText = (
            <FormattedMessage
                defaultMessage='Android Native Classic App'
                id='activity_log_modal.androidNativeClassicApp'
                values={{}}
            />
        );
        const android = {devicePicture: 'fa fa-android', deviceTitle: localizeMessage('device_icons.android', 'Android Icon'), devicePlatform: androidText};
        expect(mobileSessionInfo({device_id: 'android'})).toEqual(android);

        const appleRNText = (
            <FormattedMessage
                defaultMessage='iPhone Native App'
                id='activity_log_modal.iphoneNativeApp'
                values={{}}
            />
        );
        const appleRN = {devicePicture: 'fa fa-apple', deviceTitle: localizeMessage('device_icons.apple', 'Apple Icon'), devicePlatform: appleRNText};
        expect(mobileSessionInfo({device_id: 'apple_rn'})).toEqual(appleRN);

        const androidRNText = (
            <FormattedMessage
                defaultMessage='Android Native App'
                id='activity_log_modal.androidNativeApp'
                values={{}}
            />
        );
        const androidRN = {devicePicture: 'fa fa-android', deviceTitle: localizeMessage('device_icons.android', 'Android Icon'), devicePlatform: androidRNText};
        expect(mobileSessionInfo({device_id: 'android_rn'})).toEqual(androidRN);
    });
});
