// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow, ShallowWrapper} from 'enzyme';

import {UserProfile} from 'mattermost-redux/types/users';

import UserSettingsSecurity from './user_settings_security';

jest.mock('utils/utils.jsx', () => {
    const original = jest.requireActual('utils/utils.jsx');
    return {...original, isValidPassword: () => ({valid: true})};
});

describe('components/user_settings/display/UserSettingsDisplay', () => {
    const user = {
        id: 'user_id',
    };

    const requiredProps = {
        user: user as UserProfile,
        closeModal: jest.fn(),
        collapseModal: jest.fn(),
        setRequireConfirm: jest.fn(),
        updateSection: jest.fn(),
        authorizedApps: jest.fn(),
        actions: {
            getMe: jest.fn(),
            updateUserPassword: jest.fn(() => Promise.resolve({error: true})),
            getAuthorizedOAuthApps: jest.fn().mockResolvedValue({data: []}),
            deauthorizeOAuthApp: jest.fn().mockResolvedValue({data: true}),
        },
        canUseAccessTokens: true,
        enableOAuthServiceProvider: false,
        enableSignUpWithEmail: true,
        enableSignUpWithGitLab: false,
        enableSignUpWithGoogle: true,
        enableLdap: false,
        enableSaml: true,
        enableSignUpWithOffice365: false,
        experimentalEnableAuthenticationTransfer: true,
        passwordConfig: {},
        militaryTime: false,
    };

    test('componentDidMount() should have called getAuthorizedOAuthApps', () => {
        const props = {...requiredProps, enableOAuthServiceProvider: true};

        shallow(<UserSettingsSecurity {...props}/>);

        expect(requiredProps.actions.getAuthorizedOAuthApps).toHaveBeenCalled();
    });

    test('componentDidMount() should have updated state.authorizedApps', async () => {
        const apps = [{name: 'app1'}];
        const promise = Promise.resolve({data: apps});
        const getAuthorizedOAuthApps = () => promise;
        const props = {
            ...requiredProps,
            actions: {...requiredProps.actions, getAuthorizedOAuthApps},
            enableOAuthServiceProvider: true,
        };

        const wrapper: ShallowWrapper<any, any, UserSettingsSecurity> = shallow(<UserSettingsSecurity {...props}/>);

        await promise;

        expect(wrapper.state().authorizedApps).toEqual(apps);
    });

    test('componentDidMount() should have updated state.serverError', async () => {
        const error = {message: 'error'};
        const promise = Promise.resolve({error});
        const getAuthorizedOAuthApps = () => promise;
        const props = {
            ...requiredProps,
            actions: {...requiredProps.actions, getAuthorizedOAuthApps},
            enableOAuthServiceProvider: true,
        };

        const wrapper: ShallowWrapper<any, any, UserSettingsSecurity> = shallow(<UserSettingsSecurity {...props}/>);

        await promise;

        expect(wrapper.state('serverError')).toEqual(error.message);
    });

    test('submitPassword() should not have called updateUserPassword', async () => {
        const wrapper = shallow(<UserSettingsSecurity {...requiredProps}/>);

        await (wrapper.instance() as UserSettingsSecurity).submitPassword();
        expect(requiredProps.actions.updateUserPassword).toHaveBeenCalledTimes(0);
    });

    test('submitPassword() should have called updateUserPassword', async () => {
        const updateUserPassword = jest.fn(() => Promise.resolve({data: true}));
        const props = {
            ...requiredProps,
            actions: {...requiredProps.actions, updateUserPassword},
        };
        const wrapper = shallow(<UserSettingsSecurity {...props}/>);

        const password = 'psw';
        const state = {
            currentPassword: 'currentPassword',
            newPassword: password,
            confirmPassword: password,
        };
        wrapper.setState(state);

        await (wrapper.instance() as UserSettingsSecurity).submitPassword();

        expect(updateUserPassword).toHaveBeenCalled();
        expect(updateUserPassword).toHaveBeenCalledWith(
            user.id,
            state.currentPassword,
            state.newPassword,
        );

        expect(requiredProps.updateSection).toHaveBeenCalled();
        expect(requiredProps.updateSection).toHaveBeenCalledWith('');
    });

    test('deauthorizeApp() should have called deauthorizeOAuthApp', () => {
        const appId = 'appId';
        const event: any = {
            currentTarget: {getAttribute: jest.fn().mockReturnValue(appId)},
            preventDefault: jest.fn(),
        };

        const wrapper = shallow(<UserSettingsSecurity {...requiredProps}/>);
        wrapper.setState({authorizedApps: []});
        (wrapper.instance() as UserSettingsSecurity).deauthorizeApp(event);

        expect(requiredProps.actions.deauthorizeOAuthApp).toHaveBeenCalled();
        expect(requiredProps.actions.deauthorizeOAuthApp).toHaveBeenCalledWith(
            appId,
        );
    });

    test('deauthorizeApp() should have updated state.authorizedApps', async () => {
        const promise = Promise.resolve({data: true});
        const props = {
            ...requiredProps,
            actions: {...requiredProps.actions, deauthorizeOAuthApp: () => promise},
        };

        const wrapper: any = shallow(<UserSettingsSecurity {...props}/>);

        const appId = 'appId';
        const apps = [{id: appId}, {id: '2'}];
        const event: any = {
            currentTarget: {getAttribute: jest.fn().mockReturnValue(appId)},
            preventDefault: jest.fn(),
        };
        wrapper.setState({authorizedApps: apps});
        (wrapper.instance() as UserSettingsSecurity).deauthorizeApp(event);

        await promise;

        expect(wrapper.state().authorizedApps).toEqual(apps.slice(1));
    });

    test('deauthorizeApp() should have updated state.serverError', async () => {
        const error = {message: 'error'};
        const promise = Promise.resolve({error});
        const props = {
            ...requiredProps,
            actions: {...requiredProps.actions, deauthorizeOAuthApp: () => promise},
        };

        const wrapper: any = shallow(<UserSettingsSecurity {...props}/>);

        const event: any = {
            currentTarget: {getAttribute: jest.fn().mockReturnValue('appId')},
            preventDefault: jest.fn(),
        };
        (wrapper.instance() as UserSettingsSecurity).deauthorizeApp(event);

        await promise;

        expect(wrapper.state('serverError')).toEqual(error.message);
    });
});
