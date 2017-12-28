// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {browserHistory} from 'react-router';

import DoVerifyEmail from 'components/do_verify_email/do_verify_email.jsx';

describe('components/DoVerifyEmail', () => {
    global.window.mm_config = {};

    beforeEach(() => {
        global.window.mm_config.SiteName = 'Mattermost';
    });

    afterEach(() => {
        global.window.mm_config = {};
    });

    const requestSuccess = {
        data: 'success',
        error: null
    };

    const requestError = {
        data: null,
        error: {message: 'error message'}
    };

    const requiredProps = {
        location: {
            query: {
                token: '9f392f193973g11ggh398h39hg0ghH',
                email: 'test@example.com'
            }
        },
        actions: {verifyUserEmail: jest.fn()}
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <DoVerifyEmail {...requiredProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should show verifyStatus as pending', () => {
        const wrapper = shallow(
            <DoVerifyEmail {...requiredProps}/>
        );

        expect(wrapper.state('verifyStatus')).toEqual('pending');
    });

    test('should set serverError state on mount', () => {
        const wrapper = shallow(
            <DoVerifyEmail {...requiredProps}/>
        );

        expect(wrapper.state('serverError')).not.toBeNull();
    });

    test('should call verifyEmail function', () => {
        const wrapper = shallow(
            <DoVerifyEmail {...requiredProps}/>
        );

        const instance = wrapper.instance();
        instance.componentWillMount();
        expect(requiredProps.actions.verifyUserEmail).toHaveBeenCalledWith('9f392f193973g11ggh398h39hg0ghH');
    });

    test('should reject verifyUserEmail action & display error message', async () => {
        requiredProps.actions.verifyUserEmail = jest.genMockFunction().mockImplementation(
            () => {
                return new Promise((resolve) => {
                    process.nextTick(() => resolve(requestError));
                });
            }
        );

        const wrapper = shallow(
            <DoVerifyEmail {...requiredProps}/>
        );

        const instance = wrapper.instance();
        await instance.verifyEmail();

        expect(wrapper.state('verifyStatus')).toEqual('failure');
    });

    test('should resolve verifyUserEmail & push value to browserHistory', async () => {
        requiredProps.actions.verifyUserEmail = jest.genMockFunction().mockImplementation(
            () => {
                return new Promise((resolve) => {
                    process.nextTick(() => resolve(requestSuccess));
                });
            }
        );

        browserHistory.push = jest.fn();
        const wrapper = shallow(
            <DoVerifyEmail {...requiredProps}/>
        );

        const instance = wrapper.instance();
        await instance.verifyEmail();

        expect(wrapper.state('serverError')).toEqual('');
        expect(browserHistory.push).toHaveBeenCalledWith('/login?extra=verified&email=test%40example.com');
    });
});
