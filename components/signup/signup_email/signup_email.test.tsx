// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {UserProfile} from 'mattermost-redux/types/users';

import SignupEmail, {PasswordConfig} from 'components/signup/signup_email/signup_email';

import {browserHistory} from 'utils/browser_history';

describe('components/SignupEmail', () => {
    const requiredProps = {
        location: {
            search: '?token=9f392f193973g11ggh398h39hg0ghH&email=test@example.com',
        },
        enableSignUpWithEmail: true,
        siteName: 'Mattermost',
        termsOfServiceLink: '',
        privacyPolicyLink: '',
        customDescriptionText: '',
        passwordConfig: {} as PasswordConfig,
        actions: {
            createUser: jest.fn().mockResolvedValue({data: true}),
            loginById: jest.fn().mockResolvedValue({data: true}),
            setGlobalItem: jest.fn().mockResolvedValue({data: true}),
            getTeamInviteInfo: jest.fn().mockResolvedValue({data: true}),
        },
        hasAccounts: false,
    };

    test('should match snapshot', () => {
        const wrapper = shallow<SignupEmail>(
            <SignupEmail {...requiredProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    describe('handleSignupSuccess', () => {
        it('should not redirect with undefined teammname', async () => {
            browserHistory.push = jest.fn();

            const actions = {
                createUser: jest.fn().mockResolvedValue({data: true}),
                loginById: jest.fn().mockImplementation(() => {
                    const error = {
                        server_error_id: 'api.user.login.not_verified.app_error',
                    };

                    return Promise.resolve({error});
                }),
                setGlobalItem: jest.fn().mockResolvedValue({data: true}),
                getTeamInviteInfo: jest.fn().mockResolvedValue({data: true}),
            };

            const wrapper = shallow<SignupEmail>(
                <SignupEmail
                    {...requiredProps}
                    actions={actions}
                />,
            );

            await wrapper.instance().handleSignupSuccess(
                {email: 'test@example.com', password: 'bar', username: 'testusername', allow_marketing: true} as UserProfile,
                {id: 'foo'} as UserProfile,
            );
            expect(browserHistory.push).toHaveBeenCalledWith('/should_verify_email?email=test%40example.com');
        });

        it('should redirect with teammname if present in state', async () => {
            browserHistory.push = jest.fn();

            const actions = {
                createUser: jest.fn().mockResolvedValue({data: true}),
                loginById: jest.fn().mockImplementation(() => {
                    const error = {
                        server_error_id: 'api.user.login.not_verified.app_error',
                    };

                    return Promise.resolve({error});
                }),
                setGlobalItem: jest.fn().mockResolvedValue({data: true}),
                getTeamInviteInfo: jest.fn().mockResolvedValue({data: true}),
            };

            const wrapper = shallow<SignupEmail>(
                <SignupEmail
                    {...requiredProps}
                    actions={actions}
                />,
            );

            wrapper.setState({teamName: 'sample'});

            await wrapper.instance().handleSignupSuccess(
                {email: 'test@example.com', password: 'bar', username: 'testusername', allow_marketing: true} as UserProfile,
                {id: 'foo'} as UserProfile,
            );
            expect(browserHistory.push).toHaveBeenCalledWith('/should_verify_email?email=test%40example.com&teamname=sample');
        });
    });
});
