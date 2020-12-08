// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import assert from 'assert';

import {UserNotifyProps} from 'mattermost-redux/types/users';
import {PostType} from 'mattermost-redux/types/posts';

import {TestHelper} from 'utils/test_helper';
import store from 'stores/redux_store.jsx';

import {makeGetMentionKeysForPost} from './index';

describe('makeGetMentionKeysForPost', () => {
    const notifyProps: UserNotifyProps = {
        channel: 'true',
        comments: 'never',
        desktop: 'default',
        desktop_sound: 'true',
        email: 'true',
        first_name: 'true',
        mark_unread: 'all',
        mention_keys: '',
        push: 'default',
        push_status: 'ooo',
    };
    const channel = TestHelper.getChannelMock({});
    const team = TestHelper.getTeamMock({group_constrained: false});
    const user = TestHelper.getUserMock({
        username: 'a123',
        notify_props: notifyProps,
    });
    const group = TestHelper.getGroupMock({
        id: '123',
        name: 'developers',
        allow_reference: true,
        delete_at: 0,
    });

    const state = store.getState;
    const baseState = {
        ...state,
        entities: {
            users: {
                currentUserId: user.id,
                profiles: {
                    [user.id]: user,
                },
            },
            groups: {
                syncables: {},
                members: {},
                groups: {
                    [group.name]: group,
                },
                myGroups: {
                    [group.name]: group,
                },
            },
            teams: {
                teams: {
                    [team.id]: team,
                },
                groupsAssociatedToTeam: {
                    [team.id]: {ids: []},
                },
            },
            channels: {
                channels: {
                    [channel.id]: channel,
                },
                groupsAssociatedToChannel: {
                    [channel.id]: {ids: [group]},
                },
            },
            general: {
                config: {},
            },
            preferences: {
                myPreferences: {},
            },
        },
    };

    it('should return all mentionKeys', () => {
        const post = {
            id: 'post_id',
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
            message_source: 'message_source',
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
                disable_group_highlight: false,
                mentionHighlightDisabled: false,
            },
        };
        const getMentionKeysForPost = makeGetMentionKeysForPost();
        const results = getMentionKeysForPost(baseState, post, channel);
        const expected = [{key: '@channel'}, {key: '@all'}, {key: '@here'}, {key: '@a123'}, {key: '@developers'}];
        assert.deepEqual(results, expected);
    });

    it('should return mentionKeys without groups', () => {
        const post = {
            id: 'post_id',
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
            message_source: 'message_source',
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
                disable_group_highlight: true,
                mentionHighlightDisabled: false,
            },
        };
        const getMentionKeysForPost = makeGetMentionKeysForPost();
        const results = getMentionKeysForPost(baseState, post, channel);
        const expected = [{key: '@channel'}, {key: '@all'}, {key: '@here'}, {key: '@a123'}];
        assert.deepEqual(results, expected);
    });

    it('should return group mentions and all mentions without channel mentions', () => {
        const post = {
            id: 'post_id',
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
            message_source: 'message_source',
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
                disable_group_highlight: false,
                mentionHighlightDisabled: true,
            },
        };
        const getMentionKeysForPost = makeGetMentionKeysForPost();
        const results = getMentionKeysForPost(baseState, post, channel);
        const expected = [{key: '@a123'}, {key: '@developers'}];
        assert.deepEqual(results, expected);
    });

    it('should return all mentions without group mentions and channel mentions', () => {
        const post = {
            id: 'post_id',
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
            message_source: 'message_source',
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
                disable_group_highlight: true,
                mentionHighlightDisabled: true,
            },
        };
        const getMentionKeysForPost = makeGetMentionKeysForPost();
        const results = getMentionKeysForPost(baseState, post, channel);
        const expected = [{key: '@a123'}];
        assert.deepEqual(results, expected);
    });
});
