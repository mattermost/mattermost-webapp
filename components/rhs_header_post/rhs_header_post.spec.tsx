// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount} from 'enzyme';

import {Preferences} from 'mattermost-redux/constants';
import {TestHelper} from 'utils/test_helper';

import {mockStore} from 'tests/test_store';

import FollowButton from 'components/threading/common/follow_button';

import {WindowSizes} from 'utils/constants';

import RhsHeaderPost from './index';

describe('rhs_header_post', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'root-portal';
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild<HTMLDivElement>(container);
    });
    const initialState = {
        entities: {
            users: {
                currentUserId: '12',
                profiles: {
                    12: {
                        username: 'jessica.hyde',
                        notify_props: {
                            mention_keys: 'jessicahyde,Jessica Hyde',
                        },
                    },
                },
            },
            teams: {
                teams: {},
                currentTeamId: '22',
            },
            general: {
                config: {
                    FeatureFlagCollapsedThreads: 'true',
                    CollapsedThreads: 'default_off',
                },
            },
            preferences: {
                myPreferences: {
                    [`${Preferences.CATEGORY_DISPLAY_SETTINGS}--${Preferences.COLLAPSED_REPLY_THREADS}`]: {
                        value: 'on',
                    },
                },
            },
            posts: {
                posts: {
                    42: {
                        id: 42,
                        message: 'where is @jessica.hyde?',
                    },
                    43: {
                        id: 43,
                        message: 'not a mention',
                    },
                },
            },
            threads: {
                threads: {
                    42: {
                        id: 42,
                        reply_count: 0,
                        is_following: null,
                    },
                    43: {
                        id: 43,
                        reply_count: 0,
                        is_following: null,
                    },
                },
            },
        },
        views: {
            rhs: {
                isSidebarExpanded: false,
            },
            browser: {
                windowSize: WindowSizes.DESKTOP_VIEW,
            },
            channelSidebar: {
                firstChannelName: 'town-square',
            },
        },
    };

    const baseProps = {
        channel: TestHelper.getChannelMock(),
        currentChannelId: '32',
        rootPostId: '42',
        showMentions: jest.fn(),
        showFlaggedPosts: jest.fn(),
        showPinnedPosts: jest.fn(),
        closeRightHandSide: jest.fn(),
        toggleRhsExpanded: jest.fn(),
        setThreadFollow: jest.fn(),
    };

    test('should not crash when no root', () => {
        const {mountOptions} = mockStore(initialState);
        const wrapper = mount(
            <RhsHeaderPost
                {...baseProps}
                rootPostId='41'
            />, mountOptions);
        expect(wrapper.exists()).toBe(true);
        expect(wrapper.find(FollowButton).prop('isFollowing')).toBe(false);
    });

    test('should not show following when no replies and not mentioned', () => {
        const {mountOptions} = mockStore(initialState);
        const wrapper = mount(
            <RhsHeaderPost
                {...baseProps}
                rootPostId='43'
            />, mountOptions);
        expect(wrapper.exists()).toBe(true);
        expect(wrapper.find(FollowButton).prop('isFollowing')).toBe(false);
    });

    test('should show following when no replies but user is  mentioned', () => {
        const {mountOptions} = mockStore(initialState);
        const wrapper = mount(
            <RhsHeaderPost
                {...baseProps}
                rootPostId='42'
            />, mountOptions);
        expect(wrapper.exists()).toBe(true);
        expect(wrapper.find(FollowButton).prop('isFollowing')).toBe(true);
    });
});
