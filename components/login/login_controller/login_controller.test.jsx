// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import Constants from 'utils/constants.jsx';
import LocalStorageStore from 'stores/local_storage_store';
import LoginController from 'components/login/login_controller/login_controller';

describe('components/login/LoginController', () => {
    const baseProps = {
        location: {
            search: '',
        },
        isLicensed: false,
        customBrandText: '',
        customDescriptionText: '',
        enableCustomBrand: false,
        enableLdap: false,
        enableOpenServer: false,
        enableSaml: false,
        enableSignInWithEmail: false,
        enableSignInWithUsername: false,
        enableSignUpWithEmail: false,
        enableSignUpWithGitLab: false,
        enableSignUpWithGoogle: false,
        enableSignUpWithOffice365: false,
        experimentalPrimaryTeam: '',
        ldapLoginFieldName: '',
        samlLoginButtonText: '',
        siteName: '',
        actions: {
            checkMfa: jest.fn(),
            login: jest.fn(),
            addUserToTeamFromInvite: jest.fn(),
        },
    };

    it('should match snapshot', () => {
        const wrapper = shallowWithIntl(
            <LoginController {...baseProps}/>
        ).dive();

        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot when expired', () => {
        const props = {
            ...baseProps,
        };
        const wrapper = shallowWithIntl(
            <LoginController {...props}/>
        ).dive();
        wrapper.setState({sessionExpired: true});

        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot when initializing', () => {
        const props = {
            ...baseProps,
            initializing: true,
        };
        const wrapper = shallowWithIntl(
            <LoginController {...props}/>
        ).dive();

        expect(wrapper).toMatchSnapshot();
    });

    it('should show session expiry notification', () => {
        const props = {
            ...baseProps,
            initializing: false,
        };

        LocalStorageStore.setWasLoggedIn(true);
        const wrapper = shallowWithIntl(
            <LoginController {...props}/>
        ).dive();

        expect(wrapper).toMatchSnapshot();
    });

    it('should suppress session expiry notification on sign in change', () => {
        const props = {
            ...baseProps,
            initializing: false,
            location: {
                search: '?extra=' + Constants.SIGNIN_CHANGE,
            },
        };

        LocalStorageStore.setWasLoggedIn(true);
        const wrapper = shallowWithIntl(
            <LoginController {...props}/>
        ).dive();

        expect(wrapper).toMatchSnapshot();
    });

    it('should discard session expiry notification on failed sign in', () => {
        const props = {
            ...baseProps,
            initializing: false,
            location: {
                search: '?extra=' + Constants.SIGNIN_CHANGE,
            },
        };

        const wrapper = shallowWithIntl(
            <LoginController {...props}/>
        ).dive();

        wrapper.setState({sessionExpired: true});

        const e = {preventDefault: jest.fn()};
        wrapper.instance().preSubmit(e);

        expect(wrapper.state('sessionExpired')).toBe(false);
    });
});
