// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import UserSettingsNotifications from './user_settings_notifications';

describe('components/user_settings/display/UserSettingsDisplay', () => {
    const user = {
        id: 'user_id',
    };

    const requiredProps = {
        user,
        updateSection: jest.fn(),
        activeSection: '',
        closeModal: jest.fn(),
        collapseModal: jest.fn(),
        prevActiveSection: '',
        actions: {
            updateMe: jest.fn(() => Promise.resolve({})),
        },
    };

    test('should have called handleSubmit', async () => {
        const props = {...requiredProps, actions: {...requiredProps.actions}};
        const wrapper = shallow(<UserSettingsNotifications {...props}/>);

        await wrapper.instance().handleSubmit();
        expect(requiredProps.actions.updateMe).toHaveBeenCalled();
    });

    test('should have called handleSubmit', async () => {
        const updateMe = jest.fn(() => Promise.resolve({data: true}));

        const props = {...requiredProps, actions: {...requiredProps.actions, updateMe}};
        const wrapper = shallow(<UserSettingsNotifications {...props}/>);

        await wrapper.instance().handleSubmit();
        expect(requiredProps.updateSection).toHaveBeenCalled();
        expect(requiredProps.updateSection).toHaveBeenCalledWith('');
    });
});
