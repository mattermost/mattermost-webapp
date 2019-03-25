// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper.jsx';
import {PostListRowListIds} from 'utils/constants';

import PostListRow from './post_list_row.jsx';

describe('components/post_view/post_list_row', () => {
    test('should render null for unknown type of component', () => {
        const listId = 'unknown';
        const props = {
            listId,
        };
        const wrapper = shallowWithIntl(
            <PostListRow {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should render more messages loading indicator', () => {
        const listId = PostListRowListIds.MORE_MESSAGES_LOADER;
        const props = {
            listId,
        };
        const wrapper = shallowWithIntl(
            <PostListRow {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should render manual load messages trigger', () => {
        const listId = PostListRowListIds.MANUAL_TRIGGER_LOAD_MESSAGES;
        const loadMorePosts = jest.fn();
        const props = {
            listId,
            loadMorePosts,
        };
        const wrapper = shallowWithIntl(
            <PostListRow {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
        wrapper.prop('onClick')();
        expect(loadMorePosts).toHaveBeenCalledTimes(1);
    });

    test('should render channel header', () => {
        const listId = PostListRowListIds.CHANNEL_INTRO_MESSAGE;
        const props = {
            channel: {
                id: '123',
            },
            fullWidth: true,
            listId,
        };

        const wrapper = shallowWithIntl(
            <PostListRow {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should render new messages line', () => {
        const listId = PostListRowListIds.START_OF_NEW_MESSAGES;
        const props = {
            listId,
        };
        const wrapper = shallowWithIntl(
            <PostListRow {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should render date line', () => {
        const listId = `${PostListRowListIds.DATE_LINE}-Thu Mar 21 2019 00:00:00 GMT+0530 (India Standard Time)`;
        const props = {
            listId,
        };
        const wrapper = shallowWithIntl(
            <PostListRow {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should render post', () => {
        const props = {
            post: {
                id: '1234',
            },
            shouldHighlight: false,
            listId: '1234',
        };
        const wrapper = shallowWithIntl(
            <PostListRow {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
    });
});
