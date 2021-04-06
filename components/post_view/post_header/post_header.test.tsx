// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {shallow} from 'enzyme';

import {TestHelper} from 'utils/test_helper';

import PostHeader from './post_header';

describe('components/post_view/post_header', () => {
    const post = TestHelper.getPostMock();
    const baseProps = {
        post,
        handleCommentClick: jest.fn(),
        handleCardClick: jest.fn(),
        handleDropdownOpened: jest.fn(),
        hover: false,
        showTimeWithoutHover: false,
        enablePostUsernameOverride: false,
        isBot: false,
        isGuest: false,
        isCurrentUserLastPostGroupFirstPost: true,
        customStatus: {
            emoji: '',
            text: '',
        },
        currentUserID: '',
        isCustomStatusEnabled: false,
        showUpdateStatusButton: false,
        actions: {
            setStatusDropdown: jest.fn(),
        },
    };

    it('should match snapshot', () => {
        const wrapper = shallow(
            <PostHeader {...baseProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot when custom status is enabled and custom status is set', () => {
        const props = {
            ...baseProps,
            isCustomStatusEnabled: true,
            customStatus: {emoji: 'calender', text: 'In a meeting'},
        };
        const wrapper = shallow(
            <PostHeader {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should match snapshot when custom status is enabled and custom status is not set and post header link is enabled', () => {
        const props = {
            ...baseProps,
            isCustomStatusEnabled: true,
            showUpdateStatusButton: true,
        };
        const wrapper = shallow(
            <PostHeader {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
