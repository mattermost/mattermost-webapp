// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

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
    };

    test('should match snapshot', () => {
        const wrapper = shallowWithIntl(
            <LoginController {...baseProps}/>
        ).dive();

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when expired', () => {
        const props = {
            ...baseProps,
        };
        const wrapper = shallowWithIntl(
            <LoginController {...props}/>
        ).dive();
        wrapper.setState({sessionExpired: true});

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot when initializing', () => {
        const props = {
            ...baseProps,
            initializing: true,
        };
        const wrapper = shallowWithIntl(
            <LoginController {...props}/>
        ).dive();

        expect(wrapper).toMatchSnapshot();
    });
});
