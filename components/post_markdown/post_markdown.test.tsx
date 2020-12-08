// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Posts} from 'mattermost-redux/constants';
import {Post, PostType} from 'mattermost-redux/types/posts';

import PostMarkdown from 'components/post_markdown/post_markdown';
import Markdown from 'components/markdown';

describe('components/PostMarkdown', () => {
    const baseProps = {
        imageProps: {},
        isRHS: false,
        message: 'message',
        mentionKeys: [{key: 'a'}, {key: 'b'}, {key: 'c'}],
        channelId: 'channel-id',
    };

    test('should not error when rendering without a post', () => {
        const props = {...baseProps};
        Reflect.deleteProperty(props, 'post');

        shallow(<PostMarkdown {...props}/>);
    });

    test('should render properly with an empty post', () => {
        const wrapper = shallow(
            <PostMarkdown {...baseProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should render properly with a post', () => {
        const props = {
            ...baseProps,
            message: 'See ~test',
            post: {
                id: '123',
                message: 'text message',
                create_at: 0,
                update_at: 10,
                edit_at: 20,
                delete_at: 30,
                is_pinned: false,
                user_id: 'user_id',
                channel_id: 'channel_id',
                root_id: 'root_id',
                parent_id: 'parent_id',
                original_id: 'original_id',
                type: Posts.POST_TYPES.ADD_REMOVE as PostType,
                hashtags: 'hashtags',
                pending_post_id: 'pending_post_id',
                reply_count: 1,
                metadata: {
                    embeds: [],
                    emojis: [],
                    files: [],
                    images: {},
                    reactions: [],
                },
                props: {
                    channel_mentions: {
                        test: {
                            display_name: 'Test',
                        },
                    },
                },
            },
        };
        const wrapper = shallow(
            <PostMarkdown {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should render properly without highlight a post', () => {
        const props = {
            ...baseProps,
            message: 'No highlight',
            options: {
                mentionHighlight: false,
            },
        };
        const wrapper = shallow(
            <PostMarkdown {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should render properly without group highlight on a post', () => {
        const props = {
            ...baseProps,
            message: 'No @group highlight',
            options: {},
            post: {
                id: '123',
                message: 'text message',
                create_at: 0,
                update_at: 10,
                edit_at: 20,
                delete_at: 30,
                is_pinned: false,
                user_id: 'user_id',
                channel_id: 'channel_id',
                root_id: 'root_id',
                parent_id: 'parent_id',
                original_id: 'original_id',
                type: 'system_add_remove' as PostType,
                hashtags: 'hashtags',
                pending_post_id: 'pending_post_id',
                reply_count: 1,
                metadata: {
                    embeds: [],
                    emojis: [],
                    files: [],
                    images: {},
                    reactions: [],
                },
                props: {
                    disable_group_highlight: true,
                },
            },
        };
        const wrapper = shallow(
            <PostMarkdown {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should correctly pass postId down', () => {
        const props = {
            ...baseProps,
            post: {
                id: 'post_id',
                message: 'text message',
                create_at: 0,
                update_at: 10,
                edit_at: 20,
                delete_at: 30,
                is_pinned: false,
                user_id: 'user_id',
                channel_id: 'channel_id',
                root_id: 'root_id',
                parent_id: 'parent_id',
                original_id: 'original_id',
                type: 'system_add_remove' as PostType,
                hashtags: 'hashtags',
                pending_post_id: 'pending_post_id',
                reply_count: 1,
                metadata: {
                    embeds: [],
                    emojis: [],
                    files: [],
                    images: {},
                    reactions: [],
                },
                props: {
                    channel_mentions: {
                        test: {
                            display_name: 'Test',
                        },
                    },
                },
            },
        };
        const wrapper = shallow(
            <PostMarkdown {...props}/>,
        );
        expect(wrapper.find(Markdown).prop('postId')).toEqual(props.post.id);
        expect(wrapper).toMatchSnapshot();
    });

    test('should render header change properly', () => {
        const props = {
            ...baseProps,
            post: {
                id: 'post_id',
                type: Posts.POST_TYPES.HEADER_CHANGE as PostType,
                message: 'text message',
                create_at: 0,
                update_at: 10,
                edit_at: 20,
                delete_at: 30,
                is_pinned: false,
                user_id: 'user_id',
                channel_id: 'channel_id',
                root_id: 'root_id',
                parent_id: 'parent_id',
                original_id: 'original_id',
                hashtags: 'hashtags',
                pending_post_id: 'pending_post_id',
                reply_count: 1,
                metadata: {
                    embeds: [],
                    emojis: [],
                    files: [],
                    images: {},
                    reactions: [],
                },
                props: {
                    username: 'user',
                    old_header: 'see ~test',
                    new_header: 'now ~test',
                    channel_mentions: {
                        test: {
                            display_name: 'Test',
                        },
                    },
                },
            },
        };
        const wrapper = shallow(
            <PostMarkdown {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('plugin hooks can build upon other hook message updates', () => {
        const props = {
            ...baseProps,
            message: 'world',
            post: {
                id: '123',
                create_at: 0,
                update_at: 10,
                edit_at: 20,
                delete_at: 30,
                is_pinned: false,
                user_id: 'user_id',
                channel_id: 'channel_id',
                root_id: 'root_id',
                parent_id: 'parent_id',
                original_id: 'original_id',
                type: 'system_add_remove' as PostType,
                hashtags: 'hashtags',
                pending_post_id: 'pending_post_id',
                reply_count: 1,
                metadata: {
                    embeds: [],
                    emojis: [],
                    files: [],
                    images: {},
                    reactions: [],
                },
                message: 'world',
                props: {
                    channel_mentions: {
                        test: {
                            display_name: 'Test',
                        },
                    },
                },
            },
            pluginHooks: [
                {
                    hook: (post: Post, updatedMessage: string) => {
                        return 'hello ' + updatedMessage;
                    },
                },
                {
                    hook: (post: Post, updatedMessage: string) => {
                        return updatedMessage + '!';
                    },
                },
            ],
        };
        const wrapper = shallow(
            <PostMarkdown {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('plugin hooks can overwrite other hooks messages', () => {
        const props = {
            ...baseProps,
            message: 'world',
            post: {
                id: '123',
                create_at: 0,
                update_at: 10,
                edit_at: 20,
                delete_at: 30,
                is_pinned: false,
                user_id: 'user_id',
                channel_id: 'channel_id',
                root_id: 'root_id',
                parent_id: 'parent_id',
                original_id: 'original_id',
                type: 'system_add_remove' as PostType,
                hashtags: 'hashtags',
                pending_post_id: 'pending_post_id',
                reply_count: 1,
                metadata: {
                    embeds: [],
                    emojis: [],
                    files: [],
                    images: {},
                    reactions: [],
                },
                message: 'world',
                props: {
                    channel_mentions: {
                        test: {
                            display_name: 'Test',
                        },
                    },
                },
            },
            pluginHooks: [
                {
                    hook: (post: Post) => {
                        return 'hello ' + post.message;
                    },
                },
                {
                    hook: (post: Post) => {
                        return post.message + '!';
                    },
                },
            ],
        };
        const wrapper = shallow(
            <PostMarkdown {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
