// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ViewPinnedPosts from './view_pinned_posts';

describe('components/ChannelHeaderDropdown/MenuItem.ViewPinnedPosts', () => {
    const baseProps = {
        channel: {
            id: 'channel_id',
        },
        hasPinnedPosts: true,
        actions: {
            closeRightHandSide: jest.fn(),
            showPinnedPosts: jest.fn(),
        },
    };

    it('should match snapshot', () => {
        const wrapper = shallow(<ViewPinnedPosts {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('should runs closeRightHandSide function if has any pinned posts', () => {
        const wrapper = shallow(<ViewPinnedPosts {...baseProps}/>);

        wrapper.find('button').simulate('click', {
            preventDefault: jest.fn(),
        });

        expect(baseProps.actions.closeRightHandSide).toHaveBeenCalled();
    });

    it('should runs showPinnedPosts function if has not pinned posts', () => {
        const props = {
            ...baseProps,
            hasPinnedPosts: false,
        };
        const wrapper = shallow(<ViewPinnedPosts {...props}/>);

        wrapper.find('button').simulate('click', {
            preventDefault: jest.fn(),
        });

        expect(baseProps.actions.showPinnedPosts).toHaveBeenCalled();
    });
});
