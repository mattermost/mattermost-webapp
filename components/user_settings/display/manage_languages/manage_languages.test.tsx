// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {UserProfile} from 'mattermost-redux/types/users';

import ManageLanguages from './manage_languages';

describe('components/user_settings/display/manage_languages/manage_languages', () => {
    const user = {
        id: 'user_id',
    };

    const requiredProps = {
        user: user as UserProfile,
        locale: 'en',
        updateSection: jest.fn(),
        actions: {
            updateMe: jest.fn(() => Promise.resolve({})),
        },
    };

    test('submitUser() should have called updateMe', async () => {
        const updateMe = jest.fn(() => Promise.resolve({data: true}));
        const props = {...requiredProps, actions: {...requiredProps.actions, updateMe}};
        const wrapper = shallow(<ManageLanguages {...props}/>);
        const instance = wrapper.instance() as ManageLanguages;

        await instance.submitUser(requiredProps.user);

        expect(props.actions.updateMe).toHaveBeenCalledTimes(1);
        expect(props.actions.updateMe).toHaveBeenCalledWith(requiredProps.user);
    });
});
