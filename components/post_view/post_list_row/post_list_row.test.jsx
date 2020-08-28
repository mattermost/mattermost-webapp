// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import * as PostListUtils from 'mattermost-redux/utils/post_list';

import CombinedUserActivityPost from 'components/post_view/combined_user_activity_post';
import Post from 'components/post_view/post';
import DateSeparator from 'components/post_view/date_separator';
import NewMessageSeparator from 'components/post_view/new_message_separator/new_message_separator';
import ChannelIntroMessage from 'components/post_view/channel_intro_message/';

import {PostListRowListIds} from 'utils/constants';

import PostListRow from './post_list_row.jsx';

describe('components/post_view/post_list_row', () => {
    test('should render more messages loading indicator', () => {
        const listId = PostListRowListIds.OLDER_MESSAGES_LOADER;
        const props = {
            listId,
            loadingOlderPosts: true,
        };
        const wrapper = shallow(
            <PostListRow {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should render manual load messages trigger', () => {
        const listId = PostListRowListIds.LOAD_OLDER_MESSAGES_TRIGGER;
        const loadOlderPosts = jest.fn();
        const props = {
            listId,
            loadOlderPosts,
        };
        const wrapper = shallow(
            <PostListRow {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
        wrapper.prop('onClick')();
        expect(loadOlderPosts).toHaveBeenCalledTimes(1);
    });

    test('should render channel intro message', () => {
        const listId = PostListRowListIds.CHANNEL_INTRO_MESSAGE;
        const props = {
            channel: {
                id: '123',
            },
            fullWidth: true,
            listId,
        };

        const wrapper = shallow(
            <PostListRow {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(ChannelIntroMessage).exists()).toBe(true);
    });

    test('should render new messages line', () => {
        const listId = PostListRowListIds.START_OF_NEW_MESSAGES;
        const props = {
            listId,
        };
        const wrapper = shallow(
            <PostListRow {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(NewMessageSeparator).exists()).toBe(true);
    });

    test('should render date line', () => {
        const listId = `${PostListRowListIds.DATE_LINE}1553106600000`;
        const props = {
            listId,
        };
        const wrapper = shallow(
            <PostListRow {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(DateSeparator).exists()).toBe(true);
    });

    test('should render combined post', () => {
        const props = {
            shouldHighlight: false,
            listId: `${PostListUtils.COMBINED_USER_ACTIVITY}1234-5678`,
            previousListId: 'abcd',
        };
        const wrapper = shallow(
            <PostListRow {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(CombinedUserActivityPost).exists()).toBe(true);
    });

    test('should render post', () => {
        const props = {
            shouldHighlight: false,
            listId: '1234',
            previousListId: 'abcd',
        };
        const wrapper = shallow(
            <PostListRow {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(Post).exists()).toBe(true);
    });

    test('should have class hideAnimation for OLDER_MESSAGES_LOADER if loadingOlderPosts is false', () => {
        const listId = PostListRowListIds.OLDER_MESSAGES_LOADER;
        const props = {
            listId,
            loadingOlderPosts: false,
        };
        const wrapper = shallow(
            <PostListRow {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should have class hideAnimation for NEWER_MESSAGES_LOADER if loadingNewerPosts is false', () => {
        const listId = PostListRowListIds.NEWER_MESSAGES_LOADER;
        const props = {
            listId,
            loadingNewerPosts: false,
        };
        const wrapper = shallow(
            <PostListRow {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
