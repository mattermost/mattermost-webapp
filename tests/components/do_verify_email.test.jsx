// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import DoVerifyEmail from 'components/do_verify_email/do_verify_email.jsx';

describe('components/DoVerifyEmail', () => {
    const requiredProps = {
        location: {
            query: {
                token: '9f392f193973g11ggh398h39hg0ghH',
                email: 'test@example.com',
            },
        },
        siteName: 'Mattermost',
        actions: {verifyUserEmail: jest.fn()},
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
});
