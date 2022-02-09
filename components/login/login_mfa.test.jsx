// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import LoginMfa from 'components/login/login_mfa.jsx';

describe('components/login/LoginMfa', () => {
    const baseProps = {
        loginId: 'logid_id',
        password: 'password',
        submit: jest.fn(),
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <LoginMfa {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should have match state when handleChange is called', () => {
        const wrapper = shallow(
            <LoginMfa {...baseProps}/>,
        );

        wrapper.setState({token: ''});
        wrapper.instance().handleChange({preventDefault: jest.fn(), target: {value: '123456'}});

        expect(wrapper.state('token')).toEqual('123456');
    });

    test('should have match state when handleSubmit is called', () => {
        const submit = jest.fn();
        const props = {...baseProps, submit};
        const wrapper = shallow(
            <LoginMfa {...props}/>,
        );

        wrapper.setState({token: '', serverError: '', saving: false});
        wrapper.instance().handleSubmit({preventDefault: jest.fn()});
        expect(wrapper.state('serverError')).toEqual('');
        expect(wrapper.state('saving')).toEqual(true);
        expect(submit).toBeCalled(); // This is not a bug. See https://github.com/mattermost/mattermost-server/pull/8881
        expect(submit).toBeCalledWith(props.loginId, props.password, '');

        wrapper.setState({token: '123456', serverError: ''});
        wrapper.instance().handleSubmit({preventDefault: jest.fn()});
        expect(wrapper.state('serverError')).toEqual('');
        expect(wrapper.state('saving')).toEqual(true);
        expect(submit).toBeCalled();
        expect(submit).toBeCalledWith(props.loginId, props.password, '123456');
    });
});
