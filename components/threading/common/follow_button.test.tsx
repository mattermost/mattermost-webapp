// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {mountWithIntl} from 'tests/helpers/intl-test-helper';

import FollowButton from './follow_button';
import Button from './button';

describe('components/threading/common/follow_button', () => {
    test('should say follow and fire start action', () => {
        const start = jest.fn();
        const stop = jest.fn();

        const wrapper = mountWithIntl(
            <FollowButton
                isFollowing={false}
                start={start}
                stop={stop}
            />,
        );

        expect(wrapper).toMatchSnapshot();

        expect(wrapper.find(Button).text()).toBe('Follow');

        wrapper.find(Button).simulate('click');
        expect(start).toHaveBeenCalled();
        expect(stop).not.toHaveBeenCalled();
    });

    test('should say following and fire stop action', () => {
        const start = jest.fn();
        const stop = jest.fn();

        const wrapper = mountWithIntl(
            <FollowButton
                isFollowing={true}
                start={start}
                stop={stop}
            />,
        );

        expect(wrapper).toMatchSnapshot();

        expect(wrapper.find(Button).text()).toBe('Following');

        wrapper.find(Button).simulate('click');
        expect(start).not.toHaveBeenCalled();
        expect(stop).toHaveBeenCalled();
    });
});
