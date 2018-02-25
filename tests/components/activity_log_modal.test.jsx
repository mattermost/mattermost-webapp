// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {FormattedMessage} from 'react-intl';
import $ from 'jquery';
require('perfect-scrollbar/jquery')($);

import ActivityLogModal from 'components/activity_log_modal/activity_log_modal.jsx';
import LoadingScreen from 'components/loading_screen.jsx';

describe('components/ActivityLogModal', () => {
    const baseProps = {
        onHide: jest.fn(),
        actions: {
            getSessions: jest.fn(),
            revokeSession: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <ActivityLogModal {...baseProps}/>
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(LoadingScreen).exists()).toBe(false);

        wrapper.setState({sessions: {loading: true}});
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(LoadingScreen).exists()).toBe(true);
    });

    test('should match snapshot when submitRevoke is called', () => {
        const revokeSession = jest.genMockFunction().mockImplementation(
            () => {
                return new Promise((resolve) => {
                    process.nextTick(() => resolve());
                });
            }
        );
        const actions = {
            getSessions: jest.fn(),
            revokeSession,
        };

        const props = {...baseProps, actions};
        const wrapper = shallow(
            <ActivityLogModal {...props}/>
        );

        wrapper.instance().submitRevoke('altId', {preventDefault: jest.fn()});
        expect(wrapper).toMatchSnapshot();
        expect(revokeSession).toHaveBeenCalledTimes(1);
        expect(revokeSession).toHaveBeenCalledWith('', 'altId');
    });

    test('should have called actions.getUserAudits when onShow is called', () => {
        const actions = {
            getSessions: jest.fn(),
            revokeSession: jest.fn(),
        };
        const props = {...baseProps, actions};
        const wrapper = shallow(
            <ActivityLogModal {...props}/>
        );

        wrapper.instance().onShow();
        expect(actions.getSessions).toHaveBeenCalledTimes(2);
    });

    test('should match state when onHide is called', () => {
        const wrapper = shallow(
            <ActivityLogModal {...baseProps}/>
        );

        wrapper.setState({show: true});
        wrapper.instance().onHide();
        expect(wrapper.state('show')).toEqual(false);
    });

    test('should match state when onListenerChange is called', () => {
        const wrapper = shallow(
            <ActivityLogModal {...baseProps}/>
        );

        const newState = {sessions: [{props: {os: 'Linux', platform: 'Linux', browser: 'Desktop App'}}], clientError: null, moreInfo: [false, false], show: true};
        wrapper.setState(newState);
        wrapper.instance().onListenerChange();
        expect(wrapper.state()).toEqual({clientError: null, moreInfo: [false, false], sessions: [], show: true});
    });

    test('should match state when handleMoreInfo is called', () => {
        const wrapper = shallow(
            <ActivityLogModal {...baseProps}/>
        );

        const newState = {sessions: [{props: {os: 'Linux', platform: 'Linux', browser: 'Desktop App'}}], clientError: null, moreInfo: [false, false], show: true};
        wrapper.setState(newState);
        wrapper.instance().handleMoreInfo(1);
        expect(wrapper.state()).toEqual({...newState, moreInfo: [false, true]});
    });

    test('should match when isMobileSession is called', () => {
        const wrapper = shallow(
            <ActivityLogModal {...baseProps}/>
        );

        const isMobileSession = wrapper.instance().isMobileSession;
        expect(isMobileSession({device_id: 'apple'})).toEqual(true);
        expect(isMobileSession({device_id: 'android'})).toEqual(true);
        expect(isMobileSession({device_id: 'none'})).toEqual(false);
    });

    test('should match when mobileSessionInfo is called', () => {
        const wrapper = shallow(
            <ActivityLogModal {...baseProps}/>
        );

        const mobileSessionInfo = wrapper.instance().mobileSessionInfo;

        const apple = {devicePicture: 'fa fa-apple', devicePlatform: <FormattedMessage defaultMessage='iPhone Native Classic App' id='activity_log_modal.iphoneNativeClassicApp' values={{}}/>}; //eslint-disable-line react/jsx-max-props-per-line
        expect(mobileSessionInfo({device_id: 'apple'})).toEqual(apple);

        const android = {devicePicture: 'fa fa-android', devicePlatform: <FormattedMessage defaultMessage='Android Native Classic App' id='activity_log_modal.androidNativeClassicApp' values={{}}/>}; //eslint-disable-line react/jsx-max-props-per-line
        expect(mobileSessionInfo({device_id: 'android'})).toEqual(android);

        const appleRN = {devicePicture: 'fa fa-apple', devicePlatform: <FormattedMessage defaultMessage='iPhone Native App' id='activity_log_modal.iphoneNativeApp' values={{}}/>}; //eslint-disable-line react/jsx-max-props-per-line
        expect(mobileSessionInfo({device_id: 'apple_rn'})).toEqual(appleRN);

        const androidRN = {devicePicture: 'fa fa-android', devicePlatform: <FormattedMessage defaultMessage='Android Native App' id='activity_log_modal.androidNativeApp' values={{}}/>}; //eslint-disable-line react/jsx-max-props-per-line
        expect(mobileSessionInfo({device_id: 'android_rn'})).toEqual(androidRN);
    });
});
