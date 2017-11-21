// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow, configure} from 'enzyme';

import Adapter from 'enzyme-adapter-react-16';

import {verifyUserEmail as VerifyUserMail} from 'mattermost-redux/actions/users';

import DoVerifyEmail from 'components/do_verify_email/do_verify_email.jsx';

configure({adapter: new Adapter()});

describe('components/DoVerifyEmail', () => {
    const requiredProps = {
        location: {
            query: '',
            token: ''
        },
        actions: {verifyUserEmail: VerifyUserMail}
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <DoVerifyEmail {...requiredProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should call verifyEmail function', () => {
        const VerifyUserEmail = jest.fn();
        const wrapper = shallow(
            <DoVerifyEmail
                location={requiredProps.location}
                actions={{verifyUserEmail: VerifyUserEmail}}
            />
        );

        const instance = wrapper.instance();
        instance.componentWillMount();
        expect(VerifyUserEmail).toHaveBeenCalled();
    });

    test('should run verifyUserEmail action & display error message', () => {
        const wrapper = shallow(
            <DoVerifyEmail {...requiredProps}/>
        );
        const instance = wrapper.instance();
        instance.componentWillMount();

        // small delay needed to wait for async function (fails test otherwise)
        setTimeout(function() {
            expect(requiredProps.actions.verifyUserEmail).toHaveBeenCalled();
            expect(wrapper.state('verifyStatus')).toBe('failure');
        }, 100);
    });
});
