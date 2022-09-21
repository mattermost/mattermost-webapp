// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import assert from 'assert';

import {TestHelper} from 'utils/test_helper';

import {GlobalState} from 'types/store';

import {Post} from '@mattermost/types/posts';

import {makeGetMentionKeysForPost} from './index';

describe('makeGetMentionKeysForPost', () => {
    const channel = TestHelper.getChannelMock({});
    const team = TestHelper.getTeamMock({group_constrained: false});
    let user = TestHelper.getUserMock({
        username: 'a123',
    });
    user = {...user,
        notify_props: {
            ...user.notify_props,
            channel: 'true',
        }};
    const group = TestHelper.getGroupMock({
        id: '123',
        name: 'developers',
        allow_reference: true,
        delete_at: 0,
    });

    const baseState: GlobalState = {
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
                    [group.id]: group,
                },
                myGroups: [
                    group.id,
                ],
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
    } as unknown as GlobalState;

    it('should return all mentionKeys', () => {
        const post = {
            props: {
                disable_group_highlight: false,
                mentionHighlightDisabled: false,
            },
        } as unknown as Post;
        const getMentionKeysForPost = makeGetMentionKeysForPost();
        const results = getMentionKeysForPost(baseState, post, channel);
        const expected = [{key: '@channel'}, {key: '@all'}, {key: '@here'}, {key: '@a123'}, {key: '@developers'}];
        assert.deepEqual(results, expected);
    });

    it('should return mentionKeys without groups', () => {
        const post = {
            props: {
                disable_group_highlight: true,
                mentionHighlightDisabled: false,
            },
        } as unknown as Post;
        const getMentionKeysForPost = makeGetMentionKeysForPost();
        const results = getMentionKeysForPost(baseState, post, channel);
        const expected = [{key: '@channel'}, {key: '@all'}, {key: '@here'}, {key: '@a123'}];
        assert.deepEqual(results, expected);
    });

    it('should return group mentions and all mentions without channel mentions', () => {
        const post = {
            props: {
                disable_group_highlight: false,
                mentionHighlightDisabled: true,
            },
        } as unknown as Post;
        const getMentionKeysForPost = makeGetMentionKeysForPost();
        const results = getMentionKeysForPost(baseState, post, channel);
        const expected = [{key: '@a123'}, {key: '@developers'}];
        assert.deepEqual(results, expected);
    });

    it('should return all mentions without group mentions and channel mentions', () => {
        const post = {
            props: {
                disable_group_highlight: true,
                mentionHighlightDisabled: true,
            },
        } as unknown as Post;
        const getMentionKeysForPost = makeGetMentionKeysForPost();
        const results = getMentionKeysForPost(baseState, post, channel);
        const expected = [{key: '@a123'}];
        assert.deepEqual(results, expected);
    });
});
