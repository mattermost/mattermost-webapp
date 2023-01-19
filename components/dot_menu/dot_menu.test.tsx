// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {screen, fireEvent} from '@testing-library/react';
import {Provider} from 'react-redux';

import {shallowWithIntl} from 'tests/helpers/intl-test-helper';
import {Locations} from 'utils/constants';
import {TestHelper} from 'utils/test_helper';
import mockStore from 'tests/test_store';

import {PostType} from '@mattermost/types/posts';
import {renderWithIntl} from '../../tests/react_testing_utils';

import * as dotUtils from './utils';
jest.mock('./utils');

import DotMenu, {DotMenuClass} from './dot_menu';

describe('components/dot_menu/DotMenu', () => {
    const latestPost = {
        id: 'latest_post_id',
        user_id: 'current_user_id',
        message: 'test msg',
        channel_id: 'other_gm_channel',
        create_at: Date.now(),
    };
    const state = {
        entities: {
            general: {
                config: {},
            },
            channels: {
                myMembers: {
                    current_channel_id: {
                        channel_id: 'current_channel_id',
                        user_id: 'current_user_id',
                    },
                    direct_other_user: {
                        channel_id: 'direct_other_user',
                        user_id: 'current_user_id',
                        roles: 'channel_role',
                        last_viewed_at: 10,
                    },
                    channel_other_user: {
                        channel_id: 'channel_other_user',
                    },
                },
                channels: {
                    direct_other_user: {
                        id: 'direct_other_user',
                        name: 'current_user_id__other_user',
                    },
                },
                messageCounts: {
                    direct_other_user: {
                        root: 2,
                        total: 2,
                    },
                },
            },
            preferences: {
                myPreferences: {
                },
            },
            users: {
                profiles: {
                    current_user_id: {roles: 'system_role'},
                    other_user1: {
                        id: 'other_user1',
                        display_name: 'other_user1',
                        username: 'other_user1',
                    },
                },
                currentUserId: 'current_user_id',
                profilesInChannel: {
                    current_user_id: ['user_1'],
                },
            },
            teams: {
                currentTeamId: 'currentTeamId',
                teams: {
                    currentTeamId: {
                        id: 'currentTeamId',
                        display_name: 'test',
                        type: 'O',
                    },
                },
            },
            posts: {
                posts: {
                    [latestPost.id]: latestPost,
                },
                postsInChannel: {
                    other_gm_channel: [
                        {order: [latestPost.id], recent: true},
                    ],
                },
                postsInThread: {},
            },
        },
        views: {
            browser: {
                focused: false,
                windowSize: 'desktopView',
            },
            modals: {
                modalState: {},
                showLaunchingWorkspace: false,
            },
        },
    };
    const store = mockStore(state);
    const baseProps = {
        post: TestHelper.getPostMock({id: 'post_id_1', is_pinned: false, type: '' as PostType}),
        isLicensed: false,
        postEditTimeLimit: '-1',
        handleCommentClick: jest.fn(),
        handleDropdownOpened: jest.fn(),
        enableEmojiPicker: true,
        components: {},
        channelIsArchived: false,
        currentTeamUrl: '',
        actions: {
            flagPost: jest.fn(),
            unflagPost: jest.fn(),
            setEditingPost: jest.fn(),
            pinPost: jest.fn(),
            unpinPost: jest.fn(),
            openModal: jest.fn(),
            markPostAsUnread: jest.fn(),
            postEphemeralCallResponseForPost: jest.fn(),
            setThreadFollow: jest.fn(),
            addPostReminder: jest.fn(),
            setGlobalItem: jest.fn(),
        },
        canEdit: false,
        canDelete: false,
        isReadOnly: false,
        teamId: 'team_id_1',
        isFollowingThread: false,
        isCollapsedThreadsEnabled: true,
        isMobileView: false,
        threadId: 'post_id_1',
        threadReplyCount: 0,
        userId: 'user_id_1',
        isMilitaryTime: false,
        showForwardPostNewLabel: false,
    };

    test('should match snapshot, on Center', () => {
        const props = {
            ...baseProps,
            canEdit: true,
        };
        const wrapper = shallowWithIntl(
            <DotMenu {...props}/>,
        );

        expect(wrapper).toMatchSnapshot();

        const instance = wrapper.instance();
        const setStateMock = jest.fn();
        instance.setState = setStateMock;
        (wrapper.instance() as DotMenuClass).handleEditDisable();
        expect(setStateMock).toBeCalledWith({canEdit: false});
    });

    test('should match snapshot, canDelete', () => {
        const props = {
            ...baseProps,
            canEdit: true,
            canDelete: true,
        };
        const wrapper = renderWithIntl(
            <Provider store={store}>
                <DotMenu {...props}/>
            </Provider>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, show "New" badge on forward post', () => {
        const props = {
            ...baseProps,
            showForwardPostNewLabel: true,
        };
        const wrapper = renderWithIntl(
            <Provider store={store}>
                <DotMenu {...props}/>
            </Provider>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, hide "New" badge on forward post', () => {
        const props = {
            ...baseProps,
            showForwardPostNewLabel: false,
        };
        const wrapper = renderWithIntl(
            <Provider store={store}>
                <DotMenu {...props}/>
            </Provider>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should show mark as unread when channel is not archived', () => {
        const props = {
            ...baseProps,
            location: Locations.CENTER,
        };
        renderWithIntl(
            <Provider store={store}>
                <DotMenu {...props}/>
            </Provider>,
        );
        screen.debug(undefined, 300000);
        const button = screen.getByTestId(`PostDotMenu-Button-${baseProps.post.id}`);
        fireEvent.click(button);
        const menuItem = screen.getByTestId(`unread_post_${baseProps.post.id}`);
        expect(menuItem).toBeVisible();
    });

    test('should not show mark as unread when channel is archived', () => {
        const props = {
            ...baseProps,
            channelIsArchived: true,
        };
        renderWithIntl(
            <Provider store={store}>
                <DotMenu {...props}/>
            </Provider>,
        );
        const button = screen.getByTestId(`PostDotMenu-Button-${baseProps.post.id}`);
        fireEvent.click(button);
        const menuItem = screen.queryByTestId(`unread_post_${baseProps.post.id}`);
        expect(menuItem).toBeNull();
    });

    test('should not show mark as unread in search', () => {
        const props = {
            ...baseProps,
            location: Locations.SEARCH,
        };
        renderWithIntl(
            <Provider store={store}>
                <DotMenu {...props}/>
            </Provider>,
        );
        const button = screen.getByTestId(`PostDotMenu-Button-${baseProps.post.id}`);
        fireEvent.click(button);
        const menuItem = screen.queryByTestId(`unread_post_${baseProps.post.id}`);
        expect(menuItem).toBeNull();
    });

    describe('RHS', () => {
        test.each([
            [true, {location: Locations.RHS_ROOT, isCollapsedThreadsEnabled: true}],
            [true, {location: Locations.RHS_COMMENT, isCollapsedThreadsEnabled: true}],
            [true, {location: Locations.CENTER, isCollapsedThreadsEnabled: true}],
        ])('follow message/thread menu item should be shown only in RHS and center channel when CRT is enabled', (showing, caseProps) => {
            const props = {
                ...baseProps,
                ...caseProps,
            };
            renderWithIntl(
                <Provider store={store}>
                    <DotMenu {...props}/>
                </Provider>,
            );
            const button = screen.getByTestId(`PostDotMenu-Button-${baseProps.post.id}`);
            fireEvent.click(button);
            const menuItem = screen.getByTestId(`follow_post_thread_${baseProps.post.id}`);
            expect(menuItem).toBeVisible();
        });

        test.each([
            [false, {location: Locations.RHS_ROOT, isCollapsedThreadsEnabled: false}],
            [false, {location: Locations.RHS_COMMENT, isCollapsedThreadsEnabled: false}],
            [false, {location: Locations.CENTER, isCollapsedThreadsEnabled: false}],
            [false, {location: Locations.SEARCH, isCollapsedThreadsEnabled: true}],
            [false, {location: Locations.NO_WHERE, isCollapsedThreadsEnabled: true}],
        ])('follow message/thread menu item should be shown only in RHS and center channel when CRT is enabled', (showing, caseProps) => {
            const props = {
                ...baseProps,
                ...caseProps,
            };
            renderWithIntl(
                <Provider store={store}>
                    <DotMenu {...props}/>
                </Provider>,
            );
            const button = screen.getByTestId(`PostDotMenu-Button-${baseProps.post.id}`);
            fireEvent.click(button);
            const menuItem = screen.queryByTestId(`follow_post_thread_${baseProps.post.id}`);
            expect(menuItem).toBeNull();
        });

        test.each([
            ['Follow message', {isFollowingThread: false, threadReplyCount: 0}],
            ['Unfollow message', {isFollowingThread: true, threadReplyCount: 0}],
            ['Follow thread', {isFollowingThread: false, threadReplyCount: 1}],
            ['Unfollow thread', {isFollowingThread: true, threadReplyCount: 1}],
        ])('should show correct text', (text, caseProps) => {
            const props = {
                ...baseProps,
                ...caseProps,
                location: Locations.RHS_ROOT,
            };
            renderWithIntl(
                <Provider store={store}>
                    <DotMenu {...props}/>
                </Provider>,
            );
            const button = screen.getByTestId(`PostDotMenu-Button-${baseProps.post.id}`);
            fireEvent.click(button);
            const menuItem = screen.getByTestId(`follow_post_thread_${baseProps.post.id}`);
            expect(menuItem).toBeVisible();
            expect(menuItem).toHaveTextContent(text);
        });

        test.each([
            [false, {isFollowingThread: true}],
            [true, {isFollowingThread: false}],
        ])('should call setThreadFollow with following as %s', async (following, caseProps) => {
            const spySetThreadFollow = jest.fn();
            const spy = jest.spyOn(dotUtils, 'trackDotMenuEvent');

            const props = {
                ...baseProps,
                ...caseProps,
                location: Locations.RHS_ROOT,
                actions: {
                    ...baseProps.actions,
                    setThreadFollow: spySetThreadFollow,
                },
            };
            renderWithIntl(
                <Provider store={store}>
                    <DotMenu {...props}/>
                </Provider>,
            );
            const button = screen.getByTestId(`PostDotMenu-Button-${baseProps.post.id}`);
            fireEvent.click(button);
            screen.debug(undefined, 300000);
            const menuItem = screen.getByTestId(`follow_post_thread_${baseProps.post.id}`);
            expect(menuItem).toBeVisible();
            fireEvent.click(menuItem);
            expect(spy).toHaveBeenCalled();
            expect(spySetThreadFollow).toHaveBeenCalledWith(
                'user_id_1',
                'team_id_1',
                'post_id_1',
                following,
            );
        });
    });
});
