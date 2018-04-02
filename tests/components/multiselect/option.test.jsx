// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {UserStatuses} from 'utils/constants.jsx';

import Option from 'components/multiselect/option/option.jsx';

describe('components/login/LoginMfa', () => {
    const baseProps = {
        currentUserId: 'current_user_id',
        isSelected: false,
        onAdd: () => {}, //eslint-disable-line no-empty-function
        profilePicture: 'profile_picture_url',
        showEmail: false,
        status: UserStatuses.ONLINE,
        option: {
            id: 'option_user_id',
            delete_at: 0,
            email: 'option@user.com',
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <Option {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, option (user) is the current user', () => {
        const props = {...baseProps, currentUserId: 'option_user_id'};
        const wrapper = shallow(
            <Option {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, show email address of option (user)', () => {
        const props = {...baseProps, showEmail: true};
        const wrapper = shallow(
            <Option {...props}/>
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should have called onAdd on handleOnClick', () => {
        const props = {...baseProps, onAdd: jest.fn()};
        const wrapper = shallow(
            <Option {...props}/>
        );

        wrapper.instance().handleOnClick();
        expect(props.onAdd).toHaveBeenCalledTimes(1);
        expect(props.onAdd).toBeCalledWith(props.option);
    });
});
