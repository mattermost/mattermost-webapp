// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Posts} from 'mattermost-redux/constants';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';

import {Locations} from 'utils/constants';
import {browserHistory} from 'utils/browser_history';
import SearchResultsItem from 'components/search_results_item/search_results_item';
import PostFlagIcon from 'components/post_view/post_flag_icon';
import PostPreHeader from 'components/post_pre_header';

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

jest.mock('utils/post_utils.jsx', () => ({
    isEdited: jest.fn().mockReturnValue(true),
}));

describe('components/SearchResultsItem', () => {
    let mockFunc;
    let user;
    let post;
    let defaultProps;

    beforeEach(() => {
        mockFunc = jest.fn();

        user = {
            id: 'user_id',
            username: 'username',
            locale: 'en',
        };

        post = {
            channel_id: 'channel_id',
            create_at: 1502715365009,
            delete_at: 0,
            edit_at: 1502715372443,
            id: 'id',
            is_pinned: false,
            message: 'post message',
            original_id: '',
            parent_id: '',
            pending_post_id: '',
            props: {},
            root_id: '',
            type: '',
            update_at: 1502715372443,
            user_id: 'user_id',
        };

        defaultProps = {
            channelId: 'channel_id',
            channelName: 'channel_name',
            channelType: 'O',
            compactDisplay: true,
            post,
            user,
            currentTeamName: 'test',
            term: 'test',
            isMentionSearch: false,
            isFlagged: true,
            isBusy: false,
            status: 'hello',
            enablePostUsernameOverride: false,
            isBot: false,
            actions: {
                closeRightHandSide: mockFunc,
                selectPost: mockFunc,
                selectPostCard: mockFunc,
                setRhsExpanded: mockFunc,
            },
            directTeammate: '',
            displayName: 'Other guy',
        };
    });

    test('should match snapshot for channel', () => {
        const wrapper = shallowWithIntl(
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

        const wrapper = shallowWithIntl(
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

        const wrapper = shallowWithIntl(
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

        const wrapper = shallowWithIntl(
            <SearchResultsItem {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('Check for dotmenu dropdownOpened state', () => {
        const wrapper = shallowWithIntl(
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

        const wrapper = shallowWithIntl(
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

        const wrapper = shallowWithIntl(
            <SearchResultsItem {...props}/>,
        );

        wrapper.find('.search-item__jump').simulate('click', {preventDefault: jest.fn()});
        expect(setRhsExpanded).toHaveBeenCalledTimes(1);
        expect(setRhsExpanded).toHaveBeenLastCalledWith(false);
        expect(browserHistory.push).toHaveBeenLastCalledWith(`/${defaultProps.currentTeamName}/pl/${post.id}`);
    });

    test('should match snapshot for archived channel', () => {
        const props = {
            ...defaultProps,
            channelIsArchived: true,
        };

        const wrapper = shallowWithIntl(
            <SearchResultsItem {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should pass props correctly to PostFlagIcon', () => {
        const wrapper = shallowWithIntl(
            <SearchResultsItem {...defaultProps}/>
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

        const wrapper = shallowWithIntl(
            <SearchResultsItem {...props}/>
        );

        const postPreHeader = wrapper.find(PostPreHeader);
        expect(postPreHeader).toHaveLength(1);
        expect(postPreHeader.prop('isFlagged')).toEqual(props.isFlagged);
        expect(postPreHeader.prop('isPinned')).toEqual(props.post.is_pinned);
        expect(postPreHeader.prop('skipPinned')).toEqual(props.isPinnedPosts);
        expect(postPreHeader.prop('skipFlagged')).toEqual(props.isFlaggedPosts);
    });

    test('should not highlight the post of it is neither flagged nor pinned', () => {
        const props = {
            ...defaultProps,
            isFlagged: false,
            post: {...defaultProps.post, is_pinned: false},
        };

        const wrapper = shallowWithIntl(
            <SearchResultsItem {...props}/>
        );

        expect(wrapper.find('div.a11y__section')).toHaveLength(1);
        expect(wrapper.find('div.a11y__section').hasClass('post--pinned-or-flagged')).toBe(false);
    });

    describe('should handle post highlighting correctly for general search', () => {
        for (const testCase of [
            {
                name: 'flagged only',
                isFlagged: true,
                isPinned: false,
                expected: true,
            },
            {
                name: 'pinned only',
                isFlagged: false,
                isPinned: true,
                expected: true,
            },
            {
                name: 'pinned and flagged',
                isFlagged: true,
                isPinned: true,
                expected: true,
            }
        ]) {
            // eslint-disable-next-line no-loop-func
            test(testCase.name, () => {
                const props = {
                    ...defaultProps,
                    isFlagged: testCase.isFlagged,
                    post: {...defaultProps.post, is_pinned: testCase.isPinned},
                };

                const wrapper = shallowWithIntl(
                    <SearchResultsItem {...props}/>
                );

                expect(wrapper.find('div.a11y__section')).toHaveLength(1);
                expect(wrapper.find('div.a11y__section').hasClass('post--pinned-or-flagged')).toBe(testCase.expected);
            });
        }
    });

    describe('should handle post highlighting correctly for pinned posts', () => {
        for (const testCase of [
            {
                name: 'flagged only',
                isFlagged: true,
                isPinned: false,
                expected: true,
            },
            {
                name: 'pinned only',
                isFlagged: false,
                isPinned: true,
                expected: false,
            },
            {
                name: 'pinned and flagged',
                isFlagged: true,
                isPinned: true,
                expected: true,
            }
        ]) {
            // eslint-disable-next-line no-loop-func
            test(testCase.name, () => {
                const props = {
                    ...defaultProps,
                    isFlagged: testCase.isFlagged,
                    post: {...defaultProps.post, is_pinned: testCase.isPinned},
                    isPinnedPosts: true,
                };

                const wrapper = shallowWithIntl(
                    <SearchResultsItem {...props}/>
                );

                expect(wrapper.find('div.a11y__section')).toHaveLength(1);
                expect(wrapper.find('div.a11y__section').hasClass('post--pinned-or-flagged')).toBe(testCase.expected);
            });
        }
    });

    describe('should handle post highlighting correctly for flagged posts', () => {
        for (const testCase of [
            {
                name: 'flagged only',
                isFlagged: true,
                isPinned: false,
                expected: false,
            },
            {
                name: 'pinned only',
                isFlagged: false,
                isPinned: true,
                expected: true,
            },
            {
                name: 'pinned and flagged',
                isFlagged: true,
                isPinned: true,
                expected: true,
            }
        ]) {
            // eslint-disable-next-line no-loop-func
            test(testCase.name, () => {
                const props = {
                    ...defaultProps,
                    isFlagged: testCase.isFlagged,
                    post: {...defaultProps.post, is_pinned: testCase.isPinned},
                    isFlaggedPosts: true,
                };

                const wrapper = shallowWithIntl(
                    <SearchResultsItem {...props}/>
                );

                expect(wrapper.find('div.a11y__section')).toHaveLength(1);
                expect(wrapper.find('div.a11y__section').hasClass('post--pinned-or-flagged')).toBe(testCase.expected);
            });
        }
    });
});
