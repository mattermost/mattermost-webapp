// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';
import React from 'react';

import {Posts} from 'mattermost-redux/constants';

import {Locations} from 'utils/constants';
import {browserHistory} from 'utils/browser_history';
import SearchResultsItem from 'components/search_results_item/search_results_item';
import PostFlagIcon from 'components/post_view/post_flag_icon';
import PostPreHeader from 'components/post_view/post_pre_header';
import ThreadFooter from 'components/threading/channel_threads/thread_footer';

jest.mock('utils/browser_history', () => ({
    browserHistory: {
        push: jest.fn(),
    },
}));

jest.mock('utils/utils.jsx', () => ({
    isMobile: jest.fn().mockReturnValueOnce(false).mockReturnValue(true).mockReturnValue(false),
    getDateForUnixTicks: jest.fn().mockReturnValue(new Date('2017-12-14T18:15:28.290Z')),
    localizeMessage: jest.fn(),
}));

jest.mock('utils/post_utils', () => ({
    isEdited: jest.fn().mockReturnValue(true),
}));

describe('components/SearchResultsItem', () => {
    const mockFunc = jest.fn();

    const user = {
        id: 'user_id',
        username: 'username',
        locale: 'en',
    };

    const post = {
        channel_id: 'channel_id',
        create_at: 1502715365009,
        delete_at: 0,
        edit_at: 1502715372443,
        id: 'id',
        is_pinned: false,
        message: 'post message',
        original_id: '',
        pending_post_id: '',
        props: {},
        root_id: '',
        type: '',
        update_at: 1502715372443,
        user_id: 'user_id',
    };

    const defaultProps = {
        channelId: 'channel_id',
        channelName: 'channel_name',
        channelType: 'O',
        compactDisplay: true,
        post,
        user,
        teamName: 'test',
        term: 'test',
        isMentionSearch: false,
        isFlagged: true,
        isBusy: false,
        status: 'hello',
        enablePostUsernameOverride: false,
        isBot: false,
        isMobileView: false,
        actions: {
            closeRightHandSide: mockFunc,
            selectPost: mockFunc,
            selectPostCard: mockFunc,
            setRhsExpanded: mockFunc,
        },
        directTeammate: '',
        displayName: 'Other guy',
        canReply: true,
    };

    test('should match snapshot for channel', () => {
        const wrapper = shallow(
            <SearchResultsItem {...defaultProps}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot for deleted message with attachments by bot', () => {
        const props = {
            ...defaultProps,
            post: {
                ...post,
                file_ids: ['id', 'id2'],
                state: 'deleted',
                props: {
                    from_webhook: true,
                    override_username: 'overridden_username',
                },
            },
            enablePostUsernameOverride: true,
        };

        const wrapper = shallow(
            <SearchResultsItem {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot for deleted message', () => {
        const props = {
            ...defaultProps,
            post: {
                ...post,
                file_ids: ['id', 'id2'],
                state: Posts.POST_DELETED,
                props: {
                    from_webhook: true,
                    override_username: 'overridden_username',
                },
            },
            enablePostUsernameOverride: true,
        };

        const wrapper = shallow(
            <SearchResultsItem {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot for DM', () => {
        const props = {
            ...defaultProps,
            channelType: 'D',
            post: {
                ...post,
                is_pinned: true,
            },
        };

        const wrapper = shallow(
            <SearchResultsItem {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('Check for dotmenu dropdownOpened state', () => {
        const wrapper = shallow(
            <SearchResultsItem {...defaultProps}/>,
        );

        const instance = wrapper.instance();
        instance.handleDropdownOpened(false);
        expect(wrapper.state('dropdownOpened')).toBe(false);
        instance.handleDropdownOpened(true);
        expect(wrapper.state('dropdownOpened')).toBe(true);
    });

    test('Check for comment icon click', () => {
        const selectPost = jest.fn();
        const props = {
            ...defaultProps,
            actions: {
                ...defaultProps.actions,
                selectPost,
            },
        };

        const wrapper = shallow(
            <SearchResultsItem {...props}/>,
        );

        wrapper.find('CommentIcon').prop('handleCommentClick')({preventDefault: jest.fn()});
        expect(selectPost).toHaveBeenCalledTimes(1);
        expect(selectPost).toHaveBeenLastCalledWith(post);
    });

    test('Check for jump to message', () => {
        const setRhsExpanded = jest.fn();
        const props = {
            ...defaultProps,
            actions: {
                ...defaultProps.actions,
                setRhsExpanded,
            },
        };

        const wrapper = shallow(
            <SearchResultsItem {...props}/>,
        );

        wrapper.find('.search-item__jump').simulate('click', {preventDefault: jest.fn()});
        expect(setRhsExpanded).toHaveBeenCalledTimes(1);
        expect(setRhsExpanded).toHaveBeenLastCalledWith(false);
        expect(browserHistory.push).toHaveBeenLastCalledWith(`/${defaultProps.teamName}/pl/${post.id}`);
    });

    test('should match snapshot for archived channel', () => {
        const props = {
            ...defaultProps,
            channelIsArchived: true,
        };

        const wrapper = shallow(
            <SearchResultsItem {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should pass props correctly to PostFlagIcon', () => {
        const wrapper = shallow(
            <SearchResultsItem {...defaultProps}/>,
        );

        const flagIcon = wrapper.find(PostFlagIcon);
        expect(flagIcon).toHaveLength(1);
        expect(flagIcon.prop('location')).toEqual(Locations.SEARCH);
        expect(flagIcon.prop('postId')).toEqual(defaultProps.post.id);
        expect(flagIcon.prop('isFlagged')).toEqual(defaultProps.isFlagged);
    });

    test('should pass props correctly to PostPreHeader', () => {
        const props = {
            ...defaultProps,
            isPinnedPosts: false,
            isFlaggedPosts: true,
        };

        const wrapper = shallow(
            <SearchResultsItem {...props}/>,
        );

        const postPreHeader = wrapper.find(PostPreHeader);
        expect(postPreHeader).toHaveLength(1);
        expect(postPreHeader.prop('isFlagged')).toEqual(props.isFlagged);
        expect(postPreHeader.prop('isPinned')).toEqual(props.post.is_pinned);
        expect(postPreHeader.prop('skipPinned')).toEqual(props.isPinnedPosts);
        expect(postPreHeader.prop('skipFlagged')).toEqual(props.isFlaggedPosts);
        expect(postPreHeader.prop('channelId')).toEqual(defaultProps.post.channel_id);
    });

    test('should show team name when provided', () => {
        const props = {
            ...defaultProps,
            teamDisplayName: 'teamname',
        };

        const wrapper = shallow(
            <SearchResultsItem {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should hide reply button when said so', () => {
        const props = {
            ...defaultProps,
            canReply: false,
        };

        const wrapper = shallow(
            <SearchResultsItem {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should show the thread footer for root posts', () => {
        const props = {
            ...defaultProps,
            isCollapsedThreadsEnabled: true,
            post: {...post, reply_count: 1},
        };

        const wrapper = shallow(
            <SearchResultsItem {...props}/>,
        );

        expect(wrapper.find(ThreadFooter).exists()).toBe(true);
        expect(wrapper.find(ThreadFooter).prop('threadId')).toBe(props.post.id);
    });

    test.each([
        {isCollapsedThreadsEnabled: false},
        {isCollapsedThreadsEnabled: true, post: {...post, root_id: 'parentpostid', reply_count: 4}},
        {isCollapsedThreadsEnabled: true, post: {...post, reply_count: 0}},
    ])('should not show the thread footer', (testCaseProps) => {
        const props = {
            ...defaultProps,
            ...testCaseProps,
        };

        const wrapper = shallow(
            <SearchResultsItem {...props}/>,
        );

        expect(wrapper.find(ThreadFooter).exists()).toBe(false);
    });

    test.each([
        {post: {...post, reply_count: 4}},
        {post: {...post, root_id: 'parentpostid', reply_count: 4}},
        {channelType: 'D', post: {...post, reply_count: 4}},
    ])('should match snapshot with thread in header', (testCaseProps) => {
        const props = {
            ...defaultProps,
            ...testCaseProps,
            isCollapsedThreadsEnabled: true,
        };

        const wrapper = shallow(
            <SearchResultsItem {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test.each([
        {isCollapsedThreadsEnabled: false, post: {...post, reply_count: 4}},
        {isCollapsedThreadsEnabled: true, post: {...post, reply_count: 0}},
        {isCollapsedThreadsEnabled: true, channelType: 'D', post: {...post, reply_count: 0}},
    ])('should match snapshot with no thread in header', (testCaseProps) => {
        const props = {
            ...defaultProps,
            ...testCaseProps,
        };

        const wrapper = shallow(
            <SearchResultsItem {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });
});
