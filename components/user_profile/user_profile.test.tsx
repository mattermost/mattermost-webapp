// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {UserProfile as UserProfileType} from 'mattermost-redux/types/users';

import UserProfile from './user_profile';

describe('components/UserProfile', () => {
    const baseProps = {
        displayName: 'nickname',
        isBusy: false,
        user: {username: 'username'} as UserProfileType,
        userId: 'user_id',
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<UserProfile {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, when user is shared', () => {
        const props = {
            ...baseProps,
            isShared: true,
        };

        const wrapper = shallow(<UserProfile {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, when popover is disabled', () => {
        const wrapper = shallow(
            <UserProfile
                {...baseProps}
                disablePopover={true}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, when displayUsername is enabled', () => {
        const wrapper = shallow(
            <UserProfile
                {...baseProps}
                displayUsername={true}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
