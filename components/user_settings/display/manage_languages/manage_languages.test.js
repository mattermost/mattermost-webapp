// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ManageLanguages from './manage_languages';

describe('components/user_settings/display/manage_languages/manage_languages', () => {
    const user = {
        id: 'user_id',
    };

    const requiredProps = {
        user,
        locale: 'en',
        updateSection: jest.fn(),
        actions: {
            updateMe: jest.fn(() => Promise.resolve({})),
        },
    };

    test('submitUser() should have called updateMe', () => {
        const wrapper = shallow(<ManageLanguages {...requiredProps}/>);
        const instance = wrapper.instance();

        instance.submitUser(requiredProps.user);

        expect(requiredProps.actions.updateMe).toHaveBeenCalledTimes(1);
        expect(requiredProps.actions.updateMe).toHaveBeenCalledWith(requiredProps.user);
    });
});
