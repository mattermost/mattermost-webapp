// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import Button from '../button';

import FollowButton from './follow_button';

describe('components/threading/common/follow_button', () => {
    test('should say follow and fire start action', () => {
        const follow = jest.fn();
        const unFollow = jest.fn();

        const wrapper = mountWithIntl(
            <FollowButton
                isFollowing={false}
                follow={follow}
                unFollow={stop}
            />,
        );

        expect(wrapper).toMatchSnapshot();

        expect(wrapper.find(Button).text()).toBe('Follow');

        wrapper.find(Button).simulate('click');
        expect(follow).toHaveBeenCalled();
        expect(unFollow).not.toHaveBeenCalled();
    });

    test('should say following and fire stop action', () => {
        const follow = jest.fn();
        const unFollow = jest.fn();

        const wrapper = mountWithIntl(
            <FollowButton
                isFollowing={true}
                follow={follow}
                unFollow={unFollow}
            />,
        );

        expect(wrapper).toMatchSnapshot();

        expect(wrapper.find(Button).text()).toBe('Following');

        wrapper.find(Button).simulate('click');
        expect(follow).not.toHaveBeenCalled();
        expect(unFollow).toHaveBeenCalled();
    });
});
