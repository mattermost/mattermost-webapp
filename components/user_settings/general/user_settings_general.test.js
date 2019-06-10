// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallowWithIntl, mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';

import UserSettingsGeneral from './user_settings_general.jsx';

describe('components/user_settings/general/UserSettingsGeneral', () => {
    const user = {
        id: 'user_id',
    };

    const requiredProps = {
        intl: {},
        user,
        updateSection: jest.fn(),
        updateTab: jest.fn(),
        activeSection: '',
        prevActiveSection: '',
        closeModal: jest.fn(),
        collapseModal: jest.fn(),
        actions: {
            logError: jest.fn(),
            clearErrors: jest.fn(),
            getMe: jest.fn(),
            updateMe: jest.fn(),
            sendVerificationEmail: jest.fn(),
            setDefaultProfileImage: jest.fn(),
            uploadProfileImage: jest.fn(),
        },
        maxFileSize: 1024,
    };

    test('submitUser() should have called updateMe', () => {
        const updateMe = jest.fn().mockResolvedValue({data: true});
        const props = {...requiredProps, actions: {...requiredProps.actions, updateMe}};
        const wrapper = shallowWithIntl(<UserSettingsGeneral {...props}/>).dive();

        wrapper.instance().submitUser(requiredProps.currentUser, '');
        expect(updateMe).toHaveBeenCalledTimes(1);
        expect(updateMe).toHaveBeenCalledWith(requiredProps.currentUser);
    });

    test('submitUser() should have called getMe', async () => {
        const updateMe = jest.fn(() => Promise.resolve({data: true}));
        const getMe = jest.fn();
        const props = {...requiredProps, actions: {...requiredProps.actions, updateMe, getMe}};
        const wrapper = shallowWithIntl(<UserSettingsGeneral {...props}/>).dive();

        await wrapper.instance().submitUser(requiredProps.currentUser, '');
        expect(getMe).toHaveBeenCalledTimes(1);
        expect(getMe).toHaveBeenCalledWith();
    });

    test('submitPicture() should not have called uploadProfileImage', () => {
        const uploadProfileImage = jest.fn().mockResolvedValue({});
        const props = {...requiredProps, actions: {...requiredProps.actions, uploadProfileImage}};
        const wrapper = shallowWithIntl(<UserSettingsGeneral {...props}/>).dive();

        wrapper.instance().submitPicture(requiredProps.currentUser, '');
        expect(uploadProfileImage).toHaveBeenCalledTimes(0);
    });

    test('submitPicture() should have called uploadProfileImage', async () => {
        const uploadProfileImage = jest.fn(() => Promise.resolve({data: true}));
        const props = {...requiredProps, actions: {...requiredProps.actions, uploadProfileImage}};
        const wrapper = shallowWithIntl(<UserSettingsGeneral {...props}/>).dive();

        const mockFile = {type: 'image/jpeg', size: requiredProps.maxFileSize};
        const event = {target: {files: [mockFile]}};

        wrapper.instance().updatePicture(event);

        expect(wrapper.state('pictureFile')).toBe(event.target.files[0]);
        expect(wrapper.instance().submitActive).toBe(true);

        await wrapper.instance().submitPicture(requiredProps.currentUser, '');

        expect(uploadProfileImage).toHaveBeenCalledTimes(1);
        expect(uploadProfileImage).toHaveBeenCalledWith(requiredProps.user.id, mockFile);

        expect(wrapper.state('pictureFile')).toBe(null);
        expect(wrapper.instance().submitActive).toBe(false);

        expect(requiredProps.updateSection).toHaveBeenCalledTimes(1);
        expect(requiredProps.updateSection).toHaveBeenCalledWith('');
    });

    test('should not show position input field when LDAP or SAML position attribute is set', () => {
        const props = {...requiredProps};
        props.user = {...user};
        props.user.auth_service = 'ldap';
        props.activeSection = 'position';

        props.ldapPositionAttributeSet = false;
        props.samlPositionAttributeSet = false;

        let wrapper = mountWithIntl(<UserSettingsGeneral {...props}/>);
        expect(wrapper.find('#position').length).toBe(1);
        expect(wrapper.find('#position').is('input')).toBeTruthy();

        props.ldapPositionAttributeSet = true;
        props.samlPositionAttributeSet = false;

        wrapper = mountWithIntl(<UserSettingsGeneral {...props}/>);
        expect(wrapper.find('#position').length).toBe(0);

        props.user.auth_service = 'saml';
        props.ldapPositionAttributeSet = false;
        props.samlPositionAttributeSet = true;

        wrapper = mountWithIntl(<UserSettingsGeneral {...props}/>);
        expect(wrapper.find('#position').length).toBe(0);
    });
});
