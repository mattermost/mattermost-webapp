// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

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
        user,
        closeModal: jest.fn(),
        collapseModal: jest.fn(),
        setRequireConfirm: jest.fn(),
        updateSection: jest.fn(),
        actions: {
            getMe: jest.fn(),
            updateUserPassword: jest.fn(() => Promise.resolve({})),
        },
    };

    test('submitPassword() should not have called updateUserPassword', async () => {
        const wrapper = shallow(<UserSettingsSecurity {...requiredProps}/>);

        await wrapper.instance().submitPassword();
        expect(requiredProps.actions.updateUserPassword).toHaveBeenCalledTimes(0);
    });

    test('submitPassword() should have called updateUserPassword', async () => {
        const updateUserPassword = jest.fn(() => Promise.resolve({data: true}));
        const props = {...requiredProps, actions: {...requiredProps.actions, updateUserPassword}};
        const wrapper = shallow(<UserSettingsSecurity {...props}/>);

        const password = 'psw';
        const state = {currentPassword: 'currentPassword', newPassword: password, confirmPassword: password};
        wrapper.setState(state);

        await wrapper.instance().submitPassword();

        expect(updateUserPassword).toHaveBeenCalled();
        expect(updateUserPassword).toHaveBeenCalledWith(user.id, state.currentPassword, state.newPassword);

        expect(requiredProps.updateSection).toHaveBeenCalled();
        expect(requiredProps.updateSection).toHaveBeenCalledWith('');
    });
});
