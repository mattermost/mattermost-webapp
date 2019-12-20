// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import AdvancedSettingsDisplay from 'components/user_settings/advanced/user_settings_advanced.jsx';
import * as Utils from 'utils/utils';

jest.mock('actions/global_actions.jsx');
jest.mock('utils/utils');

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
            updateUserActive: jest.fn().mockResolvedValue({data: true}),
            revokeAllSessionsForUser: jest.fn().mockResolvedValue({data: true}),
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

    test('should have called updateUserActive', () => {
        const updateUserActive = jest.fn(() => Promise.resolve({}));
        const props = {...requiredProps, actions: {...requiredProps.actions, updateUserActive}};
        const wrapper = shallow(<AdvancedSettingsDisplay {...props}/>);

        wrapper.instance().handleDeactivateAccountSubmit();
        expect(updateUserActive).toHaveBeenCalled();
        expect(updateUserActive).toHaveBeenCalledWith(requiredProps.currentUser.id, false);
    });

    test('handleDeactivateAccountSubmit() should have called revokeAllSessions', () => {
        const wrapper = shallow(<AdvancedSettingsDisplay {...requiredProps}/>);

        wrapper.instance().handleDeactivateAccountSubmit();
        expect(requiredProps.actions.revokeAllSessionsForUser).toHaveBeenCalled();
        expect(requiredProps.actions.revokeAllSessionsForUser).toHaveBeenCalledWith(requiredProps.currentUser.id);
    });

    test('handleDeactivateAccountSubmit() should have updated state.serverError', async () => {
        const error = {message: 'error'};
        const revokeAllSessionsForUser = () => Promise.resolve({error});
        const props = {...requiredProps, actions: {...requiredProps.actions, revokeAllSessionsForUser}};
        const wrapper = shallow(<AdvancedSettingsDisplay {...props}/>);

        await wrapper.instance().handleDeactivateAccountSubmit();

        expect(wrapper.state().serverError).toEqual(error.message);
    });

    test('function getCtrlSendText should return correct value for Mac', () => {
        Utils.isMac.mockReturnValue(true);
        const props = {...requiredProps};

        const wrapper = shallow(<AdvancedSettingsDisplay {...props}/>);
        expect(wrapper.instance().getCtrlSendText().ctrlSendTitle.defaultMessage).toEqual('Send messages on CMD+ENTER');
    });

    test('function getCtrlSendText should return correct value for Windows', () => {
        Utils.isMac.mockReturnValue(false);
        const props = {...requiredProps};

        const wrapper = shallow(<AdvancedSettingsDisplay {...props}/>);
        expect(wrapper.instance().getCtrlSendText().ctrlSendTitle.defaultMessage).toEqual('Send messages on CTRL+ENTER');
    });
});
