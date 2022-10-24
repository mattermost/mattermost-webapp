// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {shallow} from 'enzyme';

import React from 'react';

import {Provider} from 'react-redux';

import {ChannelType} from '@mattermost/types/channels';
import {Post, PostEmbed} from '@mattermost/types/posts';
import {UserProfile} from '@mattermost/types/users';

import {General} from 'mattermost-redux/constants';

import mockStore from 'tests/test_store';

import PostMessagePreview, {Props} from './post_message_preview';

describe('PostMessagePreview', () => {
    const previewPost = {
        id: 'post_id',
        message: 'post message',
        metadata: {},
    } as Post;

    const broadcastedPost = {
        id: 'broadcasted_post_id',
        message: 'broadcasted post message',
        metadata: {},
        props: {
            broadcasted_thread_reply: true,
        },
        create_at: 1000,
    } as unknown as Post;

    const parentPost = {
        id: 'parent_post_id',
        message: 'parent post message',
        metadata: {},
    } as Post;

    const user = {
        id: 'user_1',
        username: 'username1',
    } as UserProfile;

    const baseProps: Props = {
        metadata: {
            channel_display_name: 'channel name',
            team_name: 'team1',
            post_id: 'post_id',
            channel_type: 'O',
            channel_id: 'channel_id',
        },
        previewPost,
        user,
        hasImageProxy: false,
        enablePostIconOverride: false,
        isEmbedVisible: true,
        compactDisplay: false,
        currentTeamUrl: 'team1',
        channelDisplayName: 'channel name',
        isPermalink: true,
        lastReplyAt: 0,
        handleFileDropdownOpened: jest.fn(),
        actions: {
            toggleEmbedVisibility: jest.fn(),
        },
        isPostPriorityEnabled: false,
    };

    const initialState = {
        entities: {
            teams: {
                currentTeamId: 'team_id1',
                teams: {
                    team_id1: {
                        id: 'team_id1',
                        name: 'team1',
                    },
                },
            },
            channels: {
                channels: {
                    channel1: {
                        id: 'channel1',
                        team_id: 'team_id1',
                        name: 'channel1',
                    },
                },
                myMembers: {},
            },
            general: {
                config: {},
            },
            users: {
                currentUserId: 'current_user_id',
                profiles: {
                    current_user_id: {
                        id: 'current_user_id',
                    },
                    user1: {
                        id: 'user1',
                    },
                },
            },
            preferences: {
                myPreferences: {},
            },
            groups: {
                groups: {},
                myGroups: [],
            },
            emojis: {
                customEmoji: {},
            },
        },
    };

    test('should render correctly', async () => {
        const store = await mockStore(initialState);

        const wrapper = shallow(
            <Provider store={store}>
                <PostMessagePreview
                    {...baseProps}
                />
            </Provider>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should render without preview', async () => {
        const store = await mockStore(initialState);

        const wrapper = shallow(
            <Provider store={store}>
                <PostMessagePreview
                    {...baseProps}
                    previewPost={undefined}
                />
            </Provider>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should not render bot icon', async () => {
        const store = await mockStore(initialState);

        const postProps = {
            override_icon_url: 'https://fakeicon.com/image.jpg',
            use_user_icon: 'false',
            from_webhook: 'false',
        };

        const postPreview = {
            ...previewPost,
            props: postProps,
        } as unknown as Post;

        const props = {
            ...baseProps,
            previewPost: postPreview,
        };

        const wrapper = shallow(
            <Provider store={store}>
                <PostMessagePreview
                    {...props}
                />
            </Provider>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should render bot icon', async () => {
        const store = await mockStore(initialState);

        const postProps = {
            override_icon_url: 'https://fakeicon.com/image.jpg',
            use_user_icon: false,
            from_webhook: 'true',
        };

        const postPreview = {
            ...previewPost,
            props: postProps,
        } as unknown as Post;

        const props = {
            ...baseProps,
            previewPost: postPreview,
            enablePostIconOverride: true,
        };
        const wrapper = shallow(
            <Provider store={store}>
                <PostMessagePreview
                    {...props}
                />
            </Provider>,
        );

        expect(wrapper).toMatchSnapshot();
    });

    describe('nested previews', () => {
        const files = {
            file_ids: [
                'file_1',
                'file_2',
            ],
        };

        const opengraphMetadata = {
            type: 'opengraph',
            url: 'https://example.com',
        } as PostEmbed;

        test('should render opengraph preview', async () => {
            const store = await mockStore(initialState);

            const postPreview = {
                ...previewPost,
                metadata: {
                    embeds: [opengraphMetadata],
                },
            } as Post;

            const props = {
                ...baseProps,
                previewPost: postPreview,
            };

            const wrapper = shallow(
                <Provider store={store}>
                    <PostMessagePreview
                        {...props}
                    />
                </Provider>,
            );

            expect(wrapper).toMatchSnapshot();
        });

        test('should render file preview', async () => {
            const store = await mockStore(initialState);

            const postPreview = {
                ...previewPost,
                ...files,
            } as Post;

            const props = {
                ...baseProps,
                previewPost: postPreview,
            };

            const wrapper = shallow(
                <Provider store={store}>
                    <PostMessagePreview
                        {...props}
                    />
                </Provider>,
            );

            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('direct and group messages', () => {
        const channelTypes = [General.DM_CHANNEL, General.GM_CHANNEL] as ChannelType[];

        test.each(channelTypes)('should render preview for %s message', async (type) => {
            const store = await mockStore(initialState);

            const metadata = {
                ...baseProps.metadata,
                team_name: '',
                channel_type: type,
                channel_id: 'channel_id',
            };

            const props = {
                ...baseProps,
                metadata,
            };

            const wrapper = shallow(
                <Provider store={store}>
                    <PostMessagePreview
                        {...props}
                    />
                </Provider>,
            );

            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('broadcasted thread replies', () => {
        test('should render broadcasted thread reply correctly', async () => {
            const store = await mockStore(initialState);

            const props = {
                ...baseProps,
                parentPost,
                previewPost: broadcastedPost,
                isPermalink: false,
            };

            const wrapper = shallow(
                <Provider store={store}>
                    <PostMessagePreview
                        {...props}
                    />
                </Provider>,
            );

            expect(wrapper).toMatchSnapshot();
        });
    });
});
