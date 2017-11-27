// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow, configure} from 'enzyme';
import {browserHistory} from 'react-router';

import Adapter from 'enzyme-adapter-react-16';

import DoVerifyEmail from 'components/do_verify_email/do_verify_email.jsx';

configure({adapter: new Adapter()});

describe('components/DoVerifyEmail', () => {
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

    test('should call verifyEmail function', () => {
        const wrapper = shallow(
            <DoVerifyEmail {...requiredProps}/>
        );

        const instance = wrapper.instance();
        instance.componentWillMount();
        expect(requiredProps.actions.verifyUserEmail).toHaveBeenCalledWith('9f392f193973g11ggh398h39hg0ghH');
    });

    test('should reject verifyUserEmail action & display error message', async () => {
        const error = true;
        requiredProps.actions.verifyUserEmail = jest.genMockFunction().mockImplementation(
            () => {
                return new Promise((resolve, reject) => {
                    process.nextTick(() => {
                        if (error) {
                            reject(requestError);
                        }
                        resolve(requestSuccess);
                    });
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
        const error = false;
        requiredProps.actions.verifyUserEmail = jest.genMockFunction().mockImplementation(
            () => {
                return new Promise((resolve, reject) => {
                    process.nextTick(() => {
                        if (error) {
                            reject(requestError);
                        }
                        resolve(requestSuccess);
                    });
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
