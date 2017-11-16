// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow, configure} from 'enzyme';

import Adapter from 'enzyme-adapter-react-16';

import DoVerifyEmail from 'components/do_verify_email/do_verify_email.jsx';

configure({adapter: new Adapter()});

describe('components/DoVerifyEmail', () => {
    const requiredProps = {
        location: {
            query: '',
            token: ''
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
        const {actions: {verifyUserEmail}} = requiredProps;
        const wrapper = shallow(
            <DoVerifyEmail {...requiredProps}/>
        );

        const instance = wrapper.instance();
        instance.componentWillMount();
        expect(verifyUserEmail).toHaveBeenCalled();
    });

    test('should display error message', async () => {
        const wrapper = shallow(
            <DoVerifyEmail {...requiredProps}/>
        );

        const instance = wrapper.instance();

        console.log(instance.props.actions.verifyUserEmail);
        const {error} = await instance.props.actions.verifyUserEmail();

        console.log(wrapper.state('verifyStatus'));
        expect(wrapper.state('verifyStatus')).not.toBe('pending');
    });
});
