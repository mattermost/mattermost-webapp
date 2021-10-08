// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import * as GlobalActions from 'actions/global_actions';
import {browserHistory} from 'utils/browser_history';
import {Constants} from 'utils/constants';

import SignupController from './signup_controller.jsx';

jest.mock('actions/global_actions', () => ({
    redirectUserToDefaultTeam: jest.fn(),
}));

jest.mock('utils/browser_history', () => ({
    browserHistory: {
        push: jest.fn(),
    },
}));

describe('components/SignupController', () => {
    const baseProps = {
        location: {
            search: '',
            pathname: '/signup_user_complete/',
            hash: '',
        },
        noAccounts: false,
        loggedIn: true,
        isLicensed: true,
        isCloud: false,
        enableOpenServer: true,
        enableSAML: true,
        enableLDAP: true,
        enableSignUpWithEmail: true,
        enableSignUpWithGitLab: true,
        enableSignUpWithGoogle: true,
        enableSignUpWithOffice365: true,
        enableSignUpWithOpenId: true,
        openidButtonText: 'OpenId',
        openidButtonColor: '#FFFFFF',
        samlLoginButtonText: 'SAML',
        ldapLoginFieldName: '',
        actions: {
            removeGlobalItem: jest.fn(),
            getTeamInviteInfo: jest.fn(),
            addUserToTeamFromInvite: jest.fn(),
        },
    };

    test('should match snapshot for all signup options enabled with isLicensed enabled', () => {
        const wrapper = shallow(
            <SignupController {...baseProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot for all signup options enabled with isLicensed disabled', () => {
        const props = {
            ...baseProps,
            isLicensed: false,
        };

        const wrapper = shallow(
            <SignupController {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should call addUserToTeamFromInvite if id exists in url', async () => {
        browserHistory.push = jest.fn();

        const addUserToTeamFromInvite = jest.fn().mockImplementation(() => Promise.resolve({data: {name: 'defaultTeam'}}));
        const getInviteInfo = jest.fn();
        const props = {
            ...baseProps,
            location: {
                ...baseProps.location,
                search: '?id=ppni7a9t87fn3j4d56rwocdctc',
            },
            actions: {
                ...baseProps.actions,
                addUserToTeamFromInvite,
                getInviteInfo,
            },
        };

        const wrapper = shallow(
            <SignupController {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
        expect(addUserToTeamFromInvite).toHaveBeenCalled();
        expect(getInviteInfo).not.toHaveBeenCalled();
        expect(GlobalActions.redirectUserToDefaultTeam).not.toHaveBeenCalled();

        await addUserToTeamFromInvite();
        expect(browserHistory.push).toHaveBeenCalledWith(`/defaultTeam/channels/${Constants.DEFAULT_CHANNEL}`);
    });

    test('should redirect user to the restricted screen when workspace out of free seats', async () => {
        browserHistory.push = jest.fn();

        const addUserToTeamFromInvite = jest.fn();
        const getInviteInfo = jest.fn();
        const props = {
            ...baseProps,
            isCloud: true,
            location: {
                ...baseProps.location,
                search: '?id=ppni7a9t87fn3j4d56rwocdctc',
            },
            subscriptionStats: {
                ...baseProps.subscriptionStats,
                is_paid_tier: 'false',
                remaining_seats: 0,
            },
            actions: {
                ...baseProps.actions,
                addUserToTeamFromInvite,
                getInviteInfo,
            },
        };

        const wrapper = shallow(
            <SignupController {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
        expect(addUserToTeamFromInvite).not.toHaveBeenCalled();
        expect(getInviteInfo).not.toHaveBeenCalled();
        expect(GlobalActions.redirectUserToDefaultTeam).not.toHaveBeenCalled();

        expect(browserHistory.push).toHaveBeenCalledWith('/error?type=max_free_users_reached');
    });

    test('should match snapshot for addUserToTeamFromInvite error', async () => {
        const addUserToTeamFromInvite = jest.fn().mockImplementation(() => Promise.resolve({error: {message: 'access denied'}}));
        const props = {
            ...baseProps,
            location: {
                ...baseProps.location,
                search: '?id=ppni7a9t87fn3j4d56rwocdctc',
            },
            actions: {
                ...baseProps.actions,
                addUserToTeamFromInvite,
            },
        };

        const wrapper = shallow(
            <SignupController {...props}/>,
        );

        expect(addUserToTeamFromInvite).toHaveBeenCalled();

        await addUserToTeamFromInvite();
        expect(wrapper).toMatchSnapshot();
    });
});
