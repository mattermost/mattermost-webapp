// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import deepFreezeAndThrowOnMutation from 'mattermost-redux/utils/deep_freeze';
import TestHelper from 'mattermost-redux/test/test_helper';
import * as Selectors from 'mattermost-redux/selectors/entities/search';

describe('Selectors.Search', () => {
    const team1 = TestHelper.fakeTeamWithId();

    const team1CurrentSearch = {params: {page: 0, per_page: 20}, isEnd: true};

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            teams: {
                currentTeamId: team1.id,
            },
            search: {
                current: {[team1.id]: team1CurrentSearch},
            },
        },
    });

    it('should return current search for current team', () => {
        assert.deepEqual(Selectors.getCurrentSearchForCurrentTeam(testState), team1CurrentSearch);
    });

    it('groups', () => {
        const userId = '1234';
        const notifyProps = {
            first_name: 'true',
        };
        const state = {
            entities: {
                users: {
                    currentUserId: userId,
                    profiles: {
                        [userId]: {id: userId, username: 'user', first_name: 'First', last_name: 'Last', notify_props: notifyProps},
                    },
                },
                groups: {
                    groups: {},
                    myGroups: {
                        test1: {
                            name: 'I-AM-THE-BEST!',
                            delete_at: 0,
                            allow_reference: true,
                        },
                        test2: {
                            name: 'Do-you-love-me?',
                            delete_at: 0,
                            allow_reference: true,
                        },
                        test3: {
                            name: 'Maybe?-A-little-bit-I-guess....',
                            delete_at: 0,
                            allow_reference: false,
                        },
                    },
                },
            },
        };

        assert.deepEqual(Selectors.getAllUserMentionKeys(state), [{key: 'First', caseSensitive: true}, {key: '@user'}, {key: '@I-AM-THE-BEST!'}, {key: '@Do-you-love-me?'}]);
    });
});
