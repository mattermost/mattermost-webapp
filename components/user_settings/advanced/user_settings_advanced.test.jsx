// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import AdvancedSettingsDisplay from 'components/user_settings/advanced/user_settings_advanced.jsx';

describe('components/user_settings/display/UserSettingsDisplay', () => {
    const user = {
        id: 'user_id',
        username: 'username',
        locale: 'en',
        timezone: {
            useAutomaticTimezone: 'true',
            automaticTimezone: 'America/New_York',
            manualTimezone: '',
        },
    };

    const requiredProps = {
        currentUser: user,
        updateSection: jest.fn(),
        activeSection: '',
        closeModal: jest.fn(),
        collapseModal: jest.fn(),
        actions: {
            savePreferences: jest.fn(),
        },
        advancedSettingsCategory: [],
        sendOnCtrlEnter: '',
        formatting: '',
        joinLeave: '',
    };

    test('should have called handleSubmit', async () => {
        const updateSection = jest.fn();

        const props = {...requiredProps, updateSection};
        const wrapper = shallow(<AdvancedSettingsDisplay {...props}/>);

        await wrapper.instance().handleSubmit();
        expect(updateSection).toHaveBeenCalledWith('');
    });

    test('should have called updateSection', () => {
        const updateSection = jest.fn();
        const props = {...requiredProps, updateSection};
        const wrapper = shallow(<AdvancedSettingsDisplay {...props}/>);

        wrapper.instance().handleUpdateSection('');
        expect(updateSection).toHaveBeenCalledWith('');

        wrapper.instance().handleUpdateSection('linkpreview');
        expect(updateSection).toHaveBeenCalledWith('linkpreview');
    });
});
