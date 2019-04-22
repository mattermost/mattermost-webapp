// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import SystemUsersDropdown from './system_users_dropdown';

describe('components/admin_console/system_users/system_users_dropdown/system_users_dropdown.jsx', () => {
    const user = {
        id: 'user_id',
        roles: '',
    };

    const requiredProps = {
        user,
        mfaEnabled: true,
        enableUserAccessTokens: true,
        experimentalEnableAuthenticationTransfer: true,
        doPasswordReset: jest.fn(),
        doEmailReset: jest.fn(),
        doManageTeams: jest.fn(),
        doManageRoles: jest.fn(),
        doManageTokens: jest.fn(),
        onError: jest.fn(),
        currentUser: user,
        teamUrl: 'teamUrl',
        index: 0,
        totalUsers: 10,
        actions: {
            updateUserActive: jest.fn(() => Promise.resolve({})),
            revokeAllSessions: jest.fn().mockResolvedValue({data: true}),
        },
    };

    test('handleMakeActive() should have called updateUserActive', async () => {
        const wrapper = shallow(<SystemUsersDropdown {...requiredProps}/>);

        const event = {preventDefault: jest.fn()};
        await wrapper.instance().handleMakeActive(event);

        expect(requiredProps.actions.updateUserActive).toHaveBeenCalledTimes(1);
        expect(requiredProps.actions.updateUserActive).toHaveBeenCalledWith(requiredProps.user.id, true);
    });

    test('handleMakeActive() should have called onError', async () => {
        const retVal = {error: {server_error_id: 'id', message: 'error'}};
        const updateUserActive = jest.fn(() => {
            return Promise.resolve(retVal);
        });
        const props = {...requiredProps, actions: {...requiredProps.actions, updateUserActive}};
        const wrapper = shallow(<SystemUsersDropdown {...props}/>);

        const event = {preventDefault: jest.fn()};
        await wrapper.instance().handleMakeActive(event);

        expect(requiredProps.onError).toHaveBeenCalledTimes(1);
        expect(requiredProps.onError).toHaveBeenCalledWith({id: retVal.error.server_error_id, ...retVal.error});
    });

    test('handleDeactivateMember() should have called updateUserActive', async () => {
        const wrapper = shallow(<SystemUsersDropdown {...requiredProps}/>);

        await wrapper.instance().handleDeactivateMember();

        expect(requiredProps.actions.updateUserActive).toHaveBeenCalledTimes(1);
        expect(requiredProps.actions.updateUserActive).toHaveBeenCalledWith(requiredProps.user.id, false);
    });

    test('handleDeactivateMember() should have called onError', async () => {
        const retVal = {error: {server_error_id: 'id', message: 'error'}};
        const updateUserActive = jest.fn(() => {
            return Promise.resolve(retVal);
        });
        const props = {...requiredProps, actions: {...requiredProps.actions, updateUserActive}};
        const wrapper = shallow(<SystemUsersDropdown {...props}/>);

        await wrapper.instance().handleDeactivateMember();

        expect(requiredProps.onError).toHaveBeenCalledTimes(1);
        expect(requiredProps.onError).toHaveBeenCalledWith({id: retVal.error.server_error_id, ...retVal.error});
    });

    test('handleRevokeSessions() should have called revokeAllSessions', async () => {
        const wrapper = shallow(<SystemUsersDropdown {...requiredProps}/>);

        await wrapper.instance().handleRevokeSessions();

        expect(requiredProps.actions.revokeAllSessions).toHaveBeenCalled();
        expect(requiredProps.actions.revokeAllSessions).toHaveBeenCalledWith(requiredProps.user.id);
    });

    test('handleRevokeSessions() should have called onError', async () => {
        const revokeAllSessions = jest.fn().mockResolvedValue({error: {}});
        const onError = jest.fn();
        const props = {...requiredProps, onError, actions: {...requiredProps.actions, revokeAllSessions}};
        const wrapper = shallow(<SystemUsersDropdown {...props}/>);

        await wrapper.instance().handleRevokeSessions();

        expect(onError).toHaveBeenCalled();
    });
});
