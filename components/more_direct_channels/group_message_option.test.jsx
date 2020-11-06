// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {shallow} from 'enzyme';

import GroupMessageOption from 'components/more_direct_channels/group_message_option';
import TestHelper from 'tests/helpers/client-test-helper';

describe('components/more_direct_channels/GroupMessageOption', () => {
    const user = TestHelper.fakeUser();
    user.username = 'test1';
    const user2 = TestHelper.fakeUser();
    user2.username = 'test2';
    const channel = TestHelper.fakeChannel();

    channel.profiles = [user, user2];

    function renderElement(onAdd = jest.fn()) {
        const selectedItemRef = {
            current: {
                getBoundingClientRect: jest.fn(() => ({
                    bottom: 100,
                    top: 50,
                })),
                scrollIntoView: jest.fn(),
            },
        };

        return shallow(
            <GroupMessageOption
                channel={channel}
                isSelected={false}
                onAdd={onAdd}
                selectedItemRef={selectedItemRef}
            />,
        );
    }

    it('should render the option', () => {
        const wrapper = renderElement();

        expect(wrapper).toMatchSnapshot();
    });

    it('should have rendered the concatenated user ids as the option', () => {
        const wrapper = renderElement();

        const name = wrapper.find('.more-modal__name').first();

        expect(name.text()).toEqual('@test1, @test2');
    });

    it('should have the right number in the icon', () => {
        const wrapper = renderElement();

        const count = wrapper.find('.more-modal__gm-icon').first();

        expect(count.text()).toBe('2');
    });

    it('should call the onClick event with an array of users', () => {
        const onAdd = jest.fn();
        const wrapper = renderElement(onAdd);
        const option = wrapper.first();

        option.simulate('click');

        expect(onAdd).toHaveBeenCalled();
        expect(onAdd).toHaveBeenCalledWith([user, user2]);
    });
});
