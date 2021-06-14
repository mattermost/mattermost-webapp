// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import {General, Preferences, Permissions} from 'mattermost-redux/constants';
import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';

import mergeObjects from 'mattermost-redux/test/merge_objects';
import TestHelper from 'mattermost-redux/test/test_helper';

import {sortChannelsByDisplayName, getDirectChannelName} from 'mattermost-redux/utils/channel_utils';
import deepFreezeAndThrowOnMutation from 'mattermost-redux/utils/deep_freeze';

import * as Selectors from './channels';

const sortUsernames = (a, b) => a.localeCompare(b, General.DEFAULT_LOCALE, {numeric: true});

describe('Selectors.Channels.getChannelsInCurrentTeam', () => {
    const team1 = TestHelper.fakeTeamWithId();
    const team2 = TestHelper.fakeTeamWithId();

    it('should return channels in current team', () => {
        const user = TestHelper.fakeUserWithId();

        const profiles = {
            [user.id]: user,
        };

        const channel1 = TestHelper.fakeChannelWithId(team1.id);
        const channel2 = TestHelper.fakeChannelWithId(team2.id);
        const channel3 = TestHelper.fakeChannelWithId(team1.id);
        const channel4 = TestHelper.fakeChannelWithId('');

        const channels = {
            [channel1.id]: channel1,
            [channel2.id]: channel2,
            [channel3.id]: channel3,
            [channel4.id]: channel4,
        };

        const channelsInTeam = {
            [team1.id]: [channel1.id, channel3.id],
            [team2.id]: [channel2.id],
            '': [channel4.id],
        };

        const testState = deepFreezeAndThrowOnMutation({
            entities: {
                users: {
                    currentUserId: user.id,
                    profiles,
                },
                teams: {
                    currentTeamId: team1.id,
                },
                channels: {
                    channels,
                    channelsInTeam,
                },
            },
        });

        const channelsInCurrentTeam = [channel1, channel3].sort(sortChannelsByDisplayName.bind(null, []));
        assert.deepEqual(Selectors.getChannelsInCurrentTeam(testState), channelsInCurrentTeam);
    });

    it('should order by user locale', () => {
        const userDe = {
            ...TestHelper.fakeUserWithId(),
            locale: 'de',
        };
        const userSv = {
            ...TestHelper.fakeUserWithId(),
            locale: 'sv',
        };

        const profilesDe = {
            [userDe.id]: userDe,
        };
        const profilesSv = {
            [userSv.id]: userSv,
        };

        const channel1 = {
            ...TestHelper.fakeChannelWithId(team1.id),
            display_name: 'z',
        };
        const channel2 = {
            ...TestHelper.fakeChannelWithId(team1.id),
            display_name: 'ä',
        };

        const channels = {
            [channel1.id]: channel1,
            [channel2.id]: channel2,
        };

        const channelsInTeam = {
            [team1.id]: [channel1.id, channel2.id],
        };

        const testStateDe = deepFreezeAndThrowOnMutation({
            entities: {
                users: {
                    currentUserId: userDe.id,
                    profiles: profilesDe,
                },
                teams: {
                    currentTeamId: team1.id,
                },
                channels: {
                    channels,
                    channelsInTeam,
                },
            },
        });

        const testStateSv = deepFreezeAndThrowOnMutation({
            entities: {
                users: {
                    currentUserId: userSv.id,
                    profiles: profilesSv,
                },
                teams: {
                    currentTeamId: team1.id,
                },
                channels: {
                    channels,
                    channelsInTeam,
                },
            },
        });

        const channelsInCurrentTeamDe = [channel1, channel2].sort(sortChannelsByDisplayName.bind(null, userDe.locale));
        const channelsInCurrentTeamSv = [channel1, channel2].sort(sortChannelsByDisplayName.bind(null, userSv.locale));

        assert.deepEqual(Selectors.getChannelsInCurrentTeam(testStateDe), channelsInCurrentTeamDe);
        assert.deepEqual(Selectors.getChannelsInCurrentTeam(testStateSv), channelsInCurrentTeamSv);
    });
});

describe('Selectors.Channels.getMyChannels', () => {
    const team1 = TestHelper.fakeTeamWithId();
    const team2 = TestHelper.fakeTeamWithId();

    const user = TestHelper.fakeUserWithId();
    const user2 = TestHelper.fakeUserWithId();
    const user3 = TestHelper.fakeUserWithId();

    const profiles = {
        [user.id]: user,
        [user2.id]: user2,
        [user3.id]: user3,
    };

    const channel1 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        display_name: 'Channel Name',
    };
    const channel2 = {
        ...TestHelper.fakeChannelWithId(team2.id),
        display_name: 'Channel Name',
    };
    const channel3 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        display_name: 'Channel Name',
    };
    const channel4 = {
        ...TestHelper.fakeChannelWithId(''),
        display_name: 'Channel Name',
        type: General.DM_CHANNEL,
        name: getDirectChannelName(user.id, user2.id),
    };
    const channel5 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        display_name: [user.username, user2.username, user3.username].join(', '),
        type: General.GM_CHANNEL,
        name: '',
    };

    const channels = {
        [channel1.id]: channel1,
        [channel2.id]: channel2,
        [channel3.id]: channel3,
        [channel4.id]: channel4,
        [channel5.id]: channel5,
    };

    const channelsInTeam = {
        [team1.id]: [channel1.id, channel3.id],
        [team2.id]: [channel2.id],
        '': [channel4.id, channel5.id],
    };

    const myMembers = {
        [channel1.id]: {},
        [channel3.id]: {},
        [channel4.id]: {},
        [channel5.id]: {},
    };

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            users: {
                currentUserId: user.id,
                profiles,
                statuses: {},
                profilesInChannel: {
                    [channel4.id]: new Set([user.id, user2.id]),
                    [channel5.id]: new Set([user.id, user2.id, user3.id]),
                },
            },
            teams: {
                currentTeamId: team1.id,
            },
            channels: {
                channels,
                channelsInTeam,
                myMembers,
            },
            preferences: {
                myPreferences: {},
            },
            general: {
                config: {},
            },
        },
    });

    it('get my channels in current team and DMs', () => {
        const channelsInCurrentTeam = [channel1, channel3].sort(sortChannelsByDisplayName.bind(null, []));
        assert.deepEqual(Selectors.getMyChannels(testState), [
            ...channelsInCurrentTeam,
            {...channel4, display_name: user2.username, status: 'offline', teammate_id: user2.id},
            {...channel5, display_name: [user2.username, user3.username].sort(sortUsernames).join(', ')},
        ]);
    });
});

describe('Selectors.Channels.getMembersInCurrentChannel', () => {
    const channel1 = TestHelper.fakeChannelWithId('');

    const user = TestHelper.fakeUserWithId();
    const user2 = TestHelper.fakeUserWithId();
    const user3 = TestHelper.fakeUserWithId();

    const membersInChannel = {
        [channel1.id]: {
            [user.id]: {},
            [user2.id]: {},
            [user3.id]: {},
        },
    };

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            channels: {
                currentChannelId: channel1.id,
                membersInChannel,
            },
        },
    });

    it('should return members in current channel', () => {
        assert.deepEqual(Selectors.getMembersInCurrentChannel(testState), membersInChannel[channel1.id]);
    });
});

describe('Selectors.Channels.getOtherChannels', () => {
    const team1 = TestHelper.fakeTeamWithId();
    const team2 = TestHelper.fakeTeamWithId();

    const user = TestHelper.fakeUserWithId();

    const profiles = {
        [user.id]: user,
    };

    const channel1 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        display_name: 'Channel Name',
        type: General.OPEN_CHANNEL,
    };
    const channel2 = {
        ...TestHelper.fakeChannelWithId(team2.id),
        display_name: 'Channel Name',
        type: General.OPEN_CHANNEL,
    };
    const channel3 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        display_name: 'Channel Name',
        type: General.PRIVATE_CHANNEL,
    };
    const channel4 = {
        ...TestHelper.fakeChannelWithId(''),
        display_name: 'Channel Name',
        type: General.DM_CHANNEL,
    };
    const channel5 = {
        ...TestHelper.fakeChannelWithId(''),
        display_name: 'Channel Name',
        type: General.OPEN_CHANNEL,
        delete_at: 444,
    };
    const channel6 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        display_name: 'Channel Name',
        type: General.OPEN_CHANNEL,
    };

    const channels = {
        [channel1.id]: channel1,
        [channel2.id]: channel2,
        [channel3.id]: channel3,
        [channel4.id]: channel4,
        [channel5.id]: channel5,
        [channel6.id]: channel6,
    };

    const channelsInTeam = {
        [team1.id]: [channel1.id, channel3.id, channel5.id, channel6.id],
        [team2.id]: [channel2.id],
        '': [channel4.id],
    };

    const myMembers = {
        [channel4.id]: {},
        [channel6.id]: {},
    };

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            users: {
                currentUserId: user.id,
                profiles,
            },
            teams: {
                currentTeamId: team1.id,
            },
            channels: {
                channels,
                channelsInTeam,
                myMembers,
            },
        },
    });

    it('get public channels not member of', () => {
        assert.deepEqual(Selectors.getOtherChannels(testState), [channel1, channel5].sort(sortChannelsByDisplayName.bind(null, [])));
    });

    it('get public, unarchived channels not member of', () => {
        assert.deepEqual(Selectors.getOtherChannels(testState, false), [channel1]);
    });
});

describe('getChannel', () => {
    const team1 = TestHelper.fakeTeamWithId();
    const team2 = TestHelper.fakeTeamWithId();

    const user = TestHelper.fakeUserWithId();
    const user2 = TestHelper.fakeUserWithId();
    const user3 = TestHelper.fakeUserWithId();

    const profiles = {
        [user.id]: user,
        [user2.id]: user2,
        [user3.id]: user3,
    };

    const channel1 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        type: General.OPEN_CHANNEL,
    };
    const channel2 = {
        ...TestHelper.fakeChannelWithId(team2.id),
        type: General.DM_CHANNEL,
        name: getDirectChannelName(user.id, user2.id),
    };
    const channel3 = {
        ...TestHelper.fakeChannelWithId(team2.id),
        type: General.GM_CHANNEL,
        display_name: [user.username, user2.username, user3.username].join(', '),
    };

    const channels = {
        [channel1.id]: channel1,
        [channel2.id]: channel2,
        [channel3.id]: channel3,
    };

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            users: {
                currentUserId: user.id,
                profiles,
                statuses: {},
                profilesInChannel: {
                    [channel2.id]: new Set([user.id, user2.id]),
                    [channel3.id]: new Set([user.id, user2.id, user3.id]),
                },
            },
            channels: {
                channels,
            },
            preferences: {
                myPreferences: {},
            },
            general: {
                config: {},
            },
        },
    });

    test('should return channels directly from the store', () => {
        expect(Selectors.getChannel(testState, channel1.id)).toBe(channel1);
        expect(Selectors.getChannel(testState, channel2.id)).toBe(channel2);
        expect(Selectors.getChannel(testState, channel3.id)).toBe(channel3);
    });
});

describe('makeGetChannel', () => {
    const team1 = TestHelper.fakeTeamWithId();
    const team2 = TestHelper.fakeTeamWithId();

    const user = TestHelper.fakeUserWithId();
    const user2 = TestHelper.fakeUserWithId();
    const user3 = TestHelper.fakeUserWithId();

    const profiles = {
        [user.id]: user,
        [user2.id]: user2,
        [user3.id]: user3,
    };

    const channel1 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        type: General.OPEN_CHANNEL,
    };
    const channel2 = {
        ...TestHelper.fakeChannelWithId(team2.id),
        type: General.DM_CHANNEL,
        name: getDirectChannelName(user.id, user2.id),
    };
    const channel3 = {
        ...TestHelper.fakeChannelWithId(team2.id),
        type: General.GM_CHANNEL,
        display_name: [user.username, user2.username, user3.username].join(', '),
    };

    const channels = {
        [channel1.id]: channel1,
        [channel2.id]: channel2,
        [channel3.id]: channel3,
    };

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            users: {
                currentUserId: user.id,
                profiles,
                statuses: {},
                profilesInChannel: {
                    [channel2.id]: new Set([user.id, user2.id]),
                    [channel3.id]: new Set([user.id, user2.id, user3.id]),
                },
            },
            channels: {
                channels,
            },
            preferences: {
                myPreferences: {},
            },
            general: {
                config: {},
            },
        },
    });

    test('should return non-DM/non-GM channels directly from the store', () => {
        const getChannel = Selectors.makeGetChannel();

        expect(getChannel(testState, {id: channel1.id})).toBe(channel1);
    });

    test('should return DMs with computed data added', () => {
        const getChannel = Selectors.makeGetChannel();

        expect(getChannel(testState, {id: channel2.id})).toEqual({
            ...channel2,
            display_name: user2.username,
            status: 'offline',
            teammate_id: user2.id,
        });
    });

    test('should return GMs with computed data added', () => {
        const getChannel = Selectors.makeGetChannel();

        expect(getChannel(testState, {id: channel3.id})).toEqual({
            ...channel3,
            display_name: [user2.username, user3.username].sort(sortUsernames).join(', '),
        });
    });
});

describe('Selectors.Channels.getChannelByName', () => {
    const team1 = TestHelper.fakeTeamWithId();
    const team2 = TestHelper.fakeTeamWithId();

    const channel1 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        name: 'ch1',
    };
    const channel2 = {
        ...TestHelper.fakeChannelWithId(team2.id),
        name: 'ch2',
    };
    const channel3 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        name: 'ch3',
    };

    const channels = {
        [channel1.id]: channel1,
        [channel2.id]: channel2,
        [channel3.id]: channel3,
    };

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            channels: {
                channels,
            },
        },
    });
    it('get first channel that matches by name', () => {
        assert.deepEqual(Selectors.getChannelByName(testState, channel3.name), channel3);
    });

    it('return null if no channel matches by name', () => {
        assert.deepEqual(Selectors.getChannelByName(testState, 'noChannel'), null);
    });
});

describe('Selectors.Channels.getChannelsNameMapInCurrentTeam', () => {
    const team1 = TestHelper.fakeTeamWithId();
    const team2 = TestHelper.fakeTeamWithId();

    const channel1 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        name: 'Ch1',
    };
    const channel2 = {
        ...TestHelper.fakeChannelWithId(team2.id),
        name: 'Ch2',
    };
    const channel3 = {
        ...TestHelper.fakeChannelWithId(team2.id),
        name: 'Ch3',
    };
    const channel4 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        name: 'Ch4',
    };

    const channels = {
        [channel1.id]: channel1,
        [channel2.id]: channel2,
        [channel3.id]: channel3,
        [channel4.id]: channel4,
    };

    const channelsInTeam = {
        [team1.id]: [channel1.id, channel4.id],
        [team2.id]: [channel2.id, channel3.id],
    };

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            teams: {
                currentTeamId: team1.id,
            },
            channels: {
                channels,
                channelsInTeam,
            },
        },
    });

    it('get channel map for current team', () => {
        const channelMap = {
            [channel1.name]: channel1,
            [channel4.name]: channel4,
        };
        assert.deepEqual(Selectors.getChannelsNameMapInCurrentTeam(testState), channelMap);
    });

    describe('memoization', () => {
        it('should return memoized result with no changes', () => {
            const originalResult = Selectors.getChannelsNameMapInCurrentTeam(testState);

            expect(Selectors.getChannelsNameMapInCurrentTeam(testState)).toBe(originalResult);
        });

        it('should not return memoized result when channels on another team changes', () => {
            // This is a known issue with the current implementation of the selector. Ideally, it would return the
            // memoized result.
            const originalResult = Selectors.getChannelsNameMapInCurrentTeam(testState);

            const state = deepFreezeAndThrowOnMutation(mergeObjects(testState, {
                entities: {
                    channels: {
                        channels: {
                            [channel3.id]: {...channel3, display_name: 'Some other name'},
                        },
                    },
                },
            }));

            expect(Selectors.getChannelsNameMapInCurrentTeam(state)).not.toBe(originalResult);
        });

        it('should not return memozied result when a returned channel changes its display name', () => {
            const originalResult = Selectors.getChannelsNameMapInCurrentTeam(testState);

            const state = deepFreezeAndThrowOnMutation(mergeObjects(testState, {
                entities: {
                    channels: {
                        channels: {
                            [channel4.id]: {...channel4, display_name: 'Some other name'},
                        },
                    },
                },
            }));

            const result = Selectors.getChannelsNameMapInCurrentTeam(state);
            expect(result).not.toBe(originalResult);
            expect(result[channel4.name].display_name).toBe('Some other name');
        });

        it('should not return memozied result when a returned channel changes something else', () => {
            const originalResult = Selectors.getChannelsNameMapInCurrentTeam(testState);

            const state = deepFreezeAndThrowOnMutation(mergeObjects(testState, {
                entities: {
                    channels: {
                        channels: {
                            [channel4.id]: {...channel4, last_post_at: 10000},
                        },
                    },
                },
            }));

            const result = Selectors.getChannelsNameMapInCurrentTeam(state);
            expect(result).not.toBe(originalResult);
            expect(result[channel4.name].last_post_at).toBe(10000);
        });
    });
});

describe('Selectors.Channels.getChannelsNameMapInTeam', () => {
    const team1 = TestHelper.fakeTeamWithId();
    const team2 = TestHelper.fakeTeamWithId();

    const channel1 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        name: 'Ch1',
    };
    const channel2 = {
        ...TestHelper.fakeChannelWithId(team2.id),
        name: 'Ch2',
    };
    const channel3 = {
        ...TestHelper.fakeChannelWithId(team2.id),
        name: 'Ch3',
    };
    const channel4 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        name: 'Ch4',
    };

    const channels = {
        [channel1.id]: channel1,
        [channel2.id]: channel2,
        [channel3.id]: channel3,
        [channel4.id]: channel4,
    };

    const channelsInTeam = {
        [team1.id]: [channel1.id, channel4.id],
        [team2.id]: [channel2.id, channel3.id],
    };

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            channels: {
                channels,
                channelsInTeam,
            },
        },
    });
    it('get channel map for team', () => {
        const channelMap = {
            [channel1.name]: channel1,
            [channel4.name]: channel4,
        };
        assert.deepEqual(Selectors.getChannelsNameMapInTeam(testState, team1.id), channelMap);
    });
    it('get empty map for non-existing team', () => {
        assert.deepEqual(Selectors.getChannelsNameMapInTeam(testState, 'junk'), {});
    });
});

describe('Selectors.Channels.getChannelNameToDisplayNameMap', () => {
    const team1 = TestHelper.fakeTeamWithId();
    const team2 = TestHelper.fakeTeamWithId();

    const channel1 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        id: 'channel1',
    };
    const channel2 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        id: 'channel2',
    };
    const channel3 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        id: 'channel3',
    };
    const channel4 = {
        ...TestHelper.fakeChannelWithId(team2.id),
        id: 'channel4',
    };

    const baseState = {
        entities: {
            channels: {
                channels: {
                    channel1,
                    channel2,
                    channel3,
                    channel4,
                },
                channelsInTeam: {
                    [team1.id]: [channel1.id, channel2.id, channel3.id],
                    [team2.id]: [channel4.id],
                },
            },
            teams: {
                currentTeamId: team1.id,
            },
        },
    };

    test('should return a map of channel names to display names for the current team', () => {
        let state = baseState;

        expect(Selectors.getChannelNameToDisplayNameMap(state)).toEqual({
            [channel1.name]: channel1.display_name,
            [channel2.name]: channel2.display_name,
            [channel3.name]: channel3.display_name,
        });

        state = mergeObjects(baseState, {
            entities: {
                teams: {
                    currentTeamId: team2.id,
                },
            },
        });

        expect(Selectors.getChannelNameToDisplayNameMap(state)).toEqual({
            [channel4.name]: channel4.display_name,
        });
    });

    describe('memoization', () => {
        test('should return the same object when called twice with the same state', () => {
            const originalResult = Selectors.getChannelNameToDisplayNameMap(baseState);

            expect(Selectors.getChannelNameToDisplayNameMap(baseState)).toBe(originalResult);
        });

        test('should return the same object when a channel on another team changes', () => {
            const originalResult = Selectors.getChannelNameToDisplayNameMap(baseState);

            const state = mergeObjects(baseState, {
                entities: {
                    channels: {
                        channels: {
                            [channel4.id]: {
                                ...channel4,
                                display_name: 'something else entirely',
                            },
                        },
                    },
                },
            });

            expect(Selectors.getChannelNameToDisplayNameMap(state)).toBe(originalResult);
        });

        test('should return the same object when a channel receives a new post', () => {
            const originalResult = Selectors.getChannelNameToDisplayNameMap(baseState);

            const state = mergeObjects(baseState, {
                entities: {
                    channels: {
                        channels: {
                            [channel1.id]: {
                                ...channel1,
                                last_post_at: 1234,
                            },
                        },
                    },
                },
            });

            expect(Selectors.getChannelNameToDisplayNameMap(state)).toBe(originalResult);
        });

        test('should return a new object when a channel is renamed', () => {
            const originalResult = Selectors.getChannelNameToDisplayNameMap(baseState);

            const state = mergeObjects(baseState, {
                entities: {
                    channels: {
                        channels: {
                            [channel2.id]: {
                                ...channel2,
                                display_name: 'something else',
                            },
                        },
                    },
                },
            });

            const result = Selectors.getChannelNameToDisplayNameMap(state);
            expect(result).not.toBe(originalResult);
            expect(result).toEqual({
                [channel1.name]: channel1.display_name,
                [channel2.name]: 'something else',
                [channel3.name]: channel3.display_name,
            });
        });

        test('should return a new object when a new team is added', () => {
            const originalResult = Selectors.getChannelNameToDisplayNameMap(baseState);

            const newChannel = {
                ...TestHelper.fakeChannelWithId(team1.id),
                id: 'newChannel',
            };

            const state = mergeObjects(baseState, {
                entities: {
                    channels: {
                        channels: {
                            newChannel,
                        },
                        channelsInTeam: {
                            [team1.id]: [channel1.id, channel2.id, channel3.id, newChannel.id],
                        },
                    },
                },
            });

            const result = Selectors.getChannelNameToDisplayNameMap(state);
            expect(result).not.toBe(originalResult);
            expect(result).toEqual({
                ...originalResult,
                [newChannel.name]: newChannel.display_name,
            });
        });
    });
});

describe('Selectors.Channels.getGroupChannels', () => {
    const team1 = TestHelper.fakeTeamWithId();

    const user = TestHelper.fakeUserWithId();
    const user2 = TestHelper.fakeUserWithId();
    const user3 = TestHelper.fakeUserWithId();

    const profiles = {
        [user.id]: user,
        [user2.id]: user2,
        [user3.id]: user3,
    };

    const channel1 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        type: General.OPEN_CHANNEL,
        display_name: 'Channel Name',
    };
    const channel2 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        type: General.PRIVATE_CHANNEL,
        display_name: 'Channel Name',
    };
    const channel3 = {
        ...TestHelper.fakeChannelWithId(''),
        type: General.GM_CHANNEL,
        display_name: [user.username, user3.username].join(', '),
        name: '',
    };
    const channel4 = {
        ...TestHelper.fakeChannelWithId(''),
        type: General.DM_CHANNEL,
        display_name: 'Channel Name',
        name: getDirectChannelName(user.id, user2.id),
    };
    const channel5 = {
        ...TestHelper.fakeChannelWithId(''),
        type: General.GM_CHANNEL,
        display_name: [user.username, user2.username, user3.username].join(', '),
        name: '',
    };

    const channels = {
        [channel1.id]: channel1,
        [channel2.id]: channel2,
        [channel3.id]: channel3,
        [channel4.id]: channel4,
        [channel5.id]: channel5,
    };

    const channelsInTeam = {
        [team1.id]: [channel1.id, channel2.id],
        '': [channel3.id, channel4.id, channel5.id],
    };

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            users: {
                currentUserId: user.id,
                profiles,
                statuses: {},
                profilesInChannel: {
                    [channel3.id]: new Set([user.id, user3.id]),
                    [channel4.id]: new Set([user.id, user2.id]),
                    [channel5.id]: new Set([user.id, user2.id, user3.id]),
                },
            },
            channels: {
                channels,
                channelsInTeam,
            },
            preferences: {
                myPreferences: {},
            },
            general: {
                config: {},
            },
        },
    });

    it('get group channels', () => {
        assert.deepEqual(Selectors.getGroupChannels(testState), [
            {...channel3, display_name: [user3.username].sort(sortUsernames).join(', ')},
            {...channel5, display_name: [user2.username, user3.username].sort(sortUsernames).join(', ')},
        ]);
    });
});

describe('Selectors.Channels.getChannelIdsInCurrentTeam', () => {
    const team1 = TestHelper.fakeTeamWithId();
    const team2 = TestHelper.fakeTeamWithId();

    const channel1 = TestHelper.fakeChannelWithId(team1.id);
    const channel2 = TestHelper.fakeChannelWithId(team1.id);
    const channel3 = TestHelper.fakeChannelWithId(team2.id);
    const channel4 = TestHelper.fakeChannelWithId(team2.id);
    const channel5 = TestHelper.fakeChannelWithId('');

    const channelsInTeam = {
        [team1.id]: [channel1.id, channel2.id],
        [team2.id]: [channel3.id, channel4.id],
        // eslint-disable-next-line no-useless-computed-key
        ['']: [channel5.id],
    };

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            teams: {
                currentTeamId: team1.id,
            },
            channels: {
                channelsInTeam,
            },
        },
    });

    it('get channel ids in current team strict equal', () => {
        const newChannel = TestHelper.fakeChannelWithId(team2.id);
        const modifiedState = {
            ...testState,
            entities: {
                ...testState.entities,
                channels: {
                    ...testState.entities.channels,
                    channelsInTeam: {
                        ...testState.entities.channels.channelsInTeam,
                        [team2.id]: [
                            ...testState.entities.channels.channelsInTeam[team2.id],
                            newChannel.id,
                        ],
                    },
                },
            },
        };

        const fromOriginalState = Selectors.getChannelIdsInCurrentTeam(testState);
        const fromModifiedState = Selectors.getChannelIdsInCurrentTeam(modifiedState);

        assert.ok(fromOriginalState === fromModifiedState);

        // it should't have a direct channel
        assert.equal(fromModifiedState.includes(channel5.id), false, 'should not have direct channel on a team');
    });
});

describe('Selectors.Channels.getChannelIdsForCurrentTeam', () => {
    const team1 = TestHelper.fakeTeamWithId();
    const team2 = TestHelper.fakeTeamWithId();

    const channel1 = TestHelper.fakeChannelWithId(team1.id);
    const channel2 = TestHelper.fakeChannelWithId(team1.id);
    const channel3 = TestHelper.fakeChannelWithId(team2.id);
    const channel4 = TestHelper.fakeChannelWithId(team2.id);
    const channel5 = TestHelper.fakeChannelWithId('');

    const channelsInTeam = {
        [team1.id]: [channel1.id, channel2.id],
        [team2.id]: [channel3.id, channel4.id],
        // eslint-disable-next-line no-useless-computed-key
        ['']: [channel5.id],
    };

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            teams: {
                currentTeamId: team1.id,
            },
            channels: {
                channelsInTeam,
            },
        },
    });

    it('get channel ids for current team strict equal', () => {
        const anotherChannel = TestHelper.fakeChannelWithId(team2.id);
        const modifiedState = {
            ...testState,
            entities: {
                ...testState.entities,
                channels: {
                    ...testState.entities.channels,
                    channelsInTeam: {
                        ...testState.entities.channels.channelsInTeam,
                        [team2.id]: [
                            ...testState.entities.channels.channelsInTeam[team2.id],
                            anotherChannel.id,
                        ],
                    },
                },
            },
        };

        const fromOriginalState = Selectors.getChannelIdsForCurrentTeam(testState);
        const fromModifiedState = Selectors.getChannelIdsForCurrentTeam(modifiedState);

        assert.ok(fromOriginalState === fromModifiedState);

        // it should have a direct channel
        assert.ok(fromModifiedState.includes(channel5.id));
    });
});

describe('Selectors.Channels.isCurrentChannelFavorite', () => {
    const team1 = TestHelper.fakeTeamWithId();

    const channel1 = TestHelper.fakeChannelWithId(team1.id);
    const channel2 = TestHelper.fakeChannelWithId(team1.id);

    const myPreferences = {
        [`${Preferences.CATEGORY_FAVORITE_CHANNEL}--${channel1.id}`]: {
            name: channel1.id,
            category: Preferences.CATEGORY_FAVORITE_CHANNEL,
            value: 'true',
        },
    };

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            channels: {
                currentChannelId: channel1.id,
            },
            general: {
                config: {
                    EnableLegacySidebar: 'true',
                },
            },
            preferences: {
                myPreferences,
            },
        },
    });

    it('isCurrentChannelFavorite', () => {
        assert.ok(Selectors.isCurrentChannelFavorite(testState) === true);

        const newState = {
            entities: {
                channels: {
                    currentChannelId: channel2.id,
                },
                preferences: {
                    myPreferences,
                },
                general: {
                    config: {
                        EnableLegacySidebar: 'true',
                    },
                },
            },
        };
        assert.ok(Selectors.isCurrentChannelFavorite(newState) === false);
    });
});

describe('Selectors.Channels.isCurrentChannelMuted', () => {
    const team1 = TestHelper.fakeTeamWithId();

    const channel1 = TestHelper.fakeChannelWithId(team1.id);
    const channel2 = TestHelper.fakeChannelWithId(team1.id);

    const myMembers = {
        [channel1.id]: {channel_id: channel1.id},
        [channel2.id]: {channel_id: channel2.id, notify_props: {mark_unread: 'mention'}},
    };

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            channels: {
                currentChannelId: channel1.id,
                myMembers,
            },
        },
    });

    it('isCurrentChannelMuted', () => {
        assert.ok(Selectors.isCurrentChannelMuted(testState) === false);

        const newState = {
            entities: {
                channels: {
                    ...testState.entities.channels,
                    currentChannelId: channel2.id,
                },
            },
        };
        assert.ok(Selectors.isCurrentChannelMuted(newState) === true);
    });
});

describe('Selectors.Channels.isCurrentChannelArchived', () => {
    const team1 = TestHelper.fakeTeamWithId();

    const channel1 = TestHelper.fakeChannelWithId(team1.id);
    const channel2 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        delete_at: 1,
    };

    const channels = {
        [channel1.id]: channel1,
        [channel2.id]: channel2,
    };

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            channels: {
                currentChannelId: channel1.id,
                channels,
            },
            preferences: {
                myPreferences: {},
            },
            general: {
                config: {},
            },
        },
    });

    it('isCurrentChannelArchived', () => {
        assert.ok(Selectors.isCurrentChannelArchived(testState) === false);

        const newState = {
            entities: {
                ...testState.entities,
                channels: {
                    ...testState.entities.channels,
                    currentChannelId: channel2.id,
                },
            },
        };

        assert.ok(Selectors.isCurrentChannelArchived(newState) === true);
    });
});

describe('Selectors.Channels.isCurrentChannelDefault', () => {
    const team1 = TestHelper.fakeTeamWithId();

    const channel1 = TestHelper.fakeChannelWithId(team1.id);
    const channel2 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        name: General.DEFAULT_CHANNEL,
    };

    const channels = {
        [channel1.id]: channel1,
        [channel2.id]: channel2,
    };

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            channels: {
                currentChannelId: channel1.id,
                channels,
            },
            preferences: {
                myPreferences: {},
            },
            general: {
                config: {},
            },
        },
    });

    it('isCurrentChannelDefault', () => {
        assert.ok(Selectors.isCurrentChannelDefault(testState) === false);

        const newState = {
            entities: {
                ...testState.entities,
                channels: {
                    ...testState.entities.channels,
                    currentChannelId: channel2.id,
                },
            },
        };

        assert.ok(Selectors.isCurrentChannelDefault(newState) === true);
    });
});

describe('Selectors.Channels.getChannelsWithUserProfiles', () => {
    const team1 = TestHelper.fakeTeamWithId();

    const channel1 = TestHelper.fakeChannelWithId(team1.id);
    const channel2 = {
        ...TestHelper.fakeChannelWithId(''),
        type: General.GM_CHANNEL,
    };

    const channels = {
        [channel1.id]: channel1,
        [channel2.id]: channel2,
    };

    const channelsInTeam = {
        [team1.id]: [channel1.id],
        // eslint-disable-next-line no-useless-computed-key
        ['']: [channel2.id],
    };

    const user1 = TestHelper.fakeUserWithId();
    const user2 = TestHelper.fakeUserWithId();
    const user3 = TestHelper.fakeUserWithId();

    const profiles = {
        [user1.id]: user1,
        [user2.id]: user2,
        [user3.id]: user3,
    };

    const profilesInChannel = {
        [channel1.id]: new Set([user1.id, user2.id]),
        [channel2.id]: new Set([user1.id, user2.id, user3.id]),
    };

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            channels: {
                channels,
                channelsInTeam,
            },
            users: {
                currentUserId: user1.id,
                profiles,
                profilesInChannel,
            },
            preferences: {
                myPreferences: {},
            },
            general: {
                config: {},
            },
        },
    });

    it('getChannelsWithUserProfiles', () => {
        const channelWithUserProfiles = Selectors.getChannelsWithUserProfiles(testState);
        assert.equal(channelWithUserProfiles.length, 1);
        assert.equal(channelWithUserProfiles[0].profiles.length, 2);
    });
});

describe('Selectors.Channels.getRedirectChannelNameForTeam', () => {
    const team1 = TestHelper.fakeTeamWithId();
    const team2 = TestHelper.fakeTeamWithId();

    const teams = {
        [team1.id]: team1,
        [team2.id]: team2,
    };

    const myTeamMembers = {
        [team1.id]: {},
        [team2.id]: {},
    };

    const channel1 = TestHelper.fakeChannelWithId(team1.id);
    const channel2 = TestHelper.fakeChannelWithId(team1.id);
    const channel3 = TestHelper.fakeChannelWithId(team1.id);

    const channels = {
        [channel1.id]: channel1,
        [channel2.id]: channel2,
        [channel3.id]: channel3,
    };

    const user1 = TestHelper.fakeUserWithId();

    const profiles = {
        [user1.id]: user1,
    };

    const myChannelMembers = {
        [channel1.id]: {channel_id: channel1.id},
        [channel2.id]: {channel_id: channel2.id},
        [channel3.id]: {channel_id: channel3.id},
    };

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            teams: {
                teams,
                myMembers: myTeamMembers,
            },
            channels: {
                channels,
                myMembers: myChannelMembers,
            },
            users: {
                currentUserId: user1.id,
                profiles,
            },
            general: {},
        },
    });

    it('getRedirectChannelNameForTeam without advanced permissions', () => {
        const modifiedState = {
            ...testState,
            entities: {
                ...testState.entities,
                general: {
                    ...testState.entities.general,
                    serverVersion: '4.8.0',
                },
            },
        };
        assert.equal(Selectors.getRedirectChannelNameForTeam(modifiedState, team1.id), General.DEFAULT_CHANNEL);
    });

    it('getRedirectChannelNameForTeam with advanced permissions but without JOIN_PUBLIC_CHANNELS permission', () => {
        const modifiedState = {
            ...testState,
            entities: {
                ...testState.entities,
                channels: {
                    ...testState.entities.channels,
                    channels: {
                        ...testState.entities.channels.channels,
                        'new-not-member-channel': {
                            id: 'new-not-member-channel',
                            display_name: '111111',
                            name: 'new-not-member-channel',
                            team_id: team1.id,
                        },
                        [channel1.id]: {
                            id: channel1.id,
                            display_name: 'aaaaaa',
                            name: 'test-channel',
                            team_id: team1.id,
                        },
                    },
                },
                roles: {
                    roles: {
                        system_user: {permissions: []},
                    },
                },
                general: {
                    ...testState.entities.general,
                    serverVersion: '5.12.0',
                },
            },
        };
        assert.equal(Selectors.getRedirectChannelNameForTeam(modifiedState, team1.id), 'test-channel');
    });

    it('getRedirectChannelNameForTeam with advanced permissions and with JOIN_PUBLIC_CHANNELS permission', () => {
        const modifiedState = {
            ...testState,
            entities: {
                ...testState.entities,
                roles: {
                    roles: {
                        system_user: {permissions: ['join_public_channels']},
                    },
                },
                general: {
                    ...testState.entities.general,
                    serverVersion: '5.12.0',
                },
            },
        };
        assert.equal(Selectors.getRedirectChannelNameForTeam(modifiedState, team1.id), General.DEFAULT_CHANNEL);
    });

    it('getRedirectChannelNameForTeam with advanced permissions but without JOIN_PUBLIC_CHANNELS permission but being member of town-square', () => {
        const modifiedState = {
            ...testState,
            entities: {
                ...testState.entities,
                channels: {
                    ...testState.entities.channels,
                    channels: {
                        ...testState.entities.channels.channels,
                        'new-not-member-channel': {
                            id: 'new-not-member-channel',
                            display_name: '111111',
                            name: 'new-not-member-channel',
                            team_id: team1.id,
                        },
                        [channel1.id]: {
                            id: channel1.id,
                            display_name: 'Town Square',
                            name: 'town-square',
                            team_id: team1.id,
                        },
                    },
                },
                roles: {
                    roles: {
                        system_user: {permissions: []},
                    },
                },
                general: {
                    ...testState.entities.general,
                    serverVersion: '5.12.0',
                },
            },
        };
        assert.equal(Selectors.getRedirectChannelNameForTeam(modifiedState, team1.id), General.DEFAULT_CHANNEL);
    });

    it('getRedirectChannelNameForTeam without advanced permissions in not current team', () => {
        const modifiedState = {
            ...testState,
            entities: {
                ...testState.entities,
                general: {
                    ...testState.entities.general,
                    serverVersion: '4.8.0',
                },
            },
        };
        assert.equal(Selectors.getRedirectChannelNameForTeam(modifiedState, team2.id), General.DEFAULT_CHANNEL);
    });

    it('getRedirectChannelNameForTeam with advanced permissions but without JOIN_PUBLIC_CHANNELS permission in not current team', () => {
        const modifiedState = {
            ...testState,
            entities: {
                ...testState.entities,
                channels: {
                    ...testState.entities.channels,
                    channels: {
                        ...testState.entities.channels.channels,
                        'new-not-member-channel': {
                            id: 'new-not-member-channel',
                            display_name: '111111',
                            name: 'new-not-member-channel',
                            team_id: team2.id,
                        },
                        [channel3.id]: {
                            id: channel3.id,
                            display_name: 'aaaaaa',
                            name: 'test-channel',
                            team_id: team2.id,
                        },
                    },
                },
                roles: {
                    roles: {
                        system_user: {permissions: []},
                    },
                },
                general: {
                    ...testState.entities.general,
                    serverVersion: '5.12.0',
                },
            },
        };
        assert.equal(Selectors.getRedirectChannelNameForTeam(modifiedState, team2.id), 'test-channel');
    });

    it('getRedirectChannelNameForTeam with advanced permissions and with JOIN_PUBLIC_CHANNELS permission in not current team', () => {
        const modifiedState = {
            ...testState,
            entities: {
                ...testState.entities,
                roles: {
                    roles: {
                        system_user: {permissions: ['join_public_channels']},
                    },
                },
                general: {
                    ...testState.entities.general,
                    serverVersion: '5.12.0',
                },
            },
        };
        assert.equal(Selectors.getRedirectChannelNameForTeam(modifiedState, team2.id), General.DEFAULT_CHANNEL);
    });

    it('getRedirectChannelNameForTeam with advanced permissions but without JOIN_PUBLIC_CHANNELS permission but being member of town-square in not current team', () => {
        const modifiedState = {
            ...testState,
            entities: {
                ...testState.entities,
                channels: {
                    ...testState.entities.channels,
                    channels: {
                        ...testState.entities.channels.channels,
                        'new-not-member-channel': {
                            id: 'new-not-member-channel',
                            display_name: '111111',
                            name: 'new-not-member-channel',
                            team_id: team2.id,
                        },
                        [channel3.id]: {
                            id: channel3.id,
                            display_name: 'Town Square',
                            name: 'town-square',
                            team_id: team2.id,
                        },
                    },
                },
                roles: {
                    roles: {
                        system_user: {permissions: []},
                    },
                },
                general: {
                    ...testState.entities.general,
                    serverVersion: '5.12.0',
                },
            },
        };
        assert.equal(Selectors.getRedirectChannelNameForTeam(modifiedState, team2.id), General.DEFAULT_CHANNEL);
    });
});

describe('Selectors.Channels.getDirectAndGroupChannels', () => {
    const user1 = TestHelper.fakeUserWithId();
    const user2 = TestHelper.fakeUserWithId();
    const user3 = TestHelper.fakeUserWithId();

    const channel1 = {
        ...TestHelper.fakeChannelWithId(''),
        display_name: [user1.username, user2.username, user3.username].join(', '),
        type: General.GM_CHANNEL,
    };
    const channel2 = {
        ...TestHelper.fakeChannelWithId(''),
        name: getDirectChannelName(user1.id, user2.id),
        type: General.DM_CHANNEL,
    };
    const channel3 = {
        ...TestHelper.fakeChannelWithId(''),
        name: getDirectChannelName(user1.id, user3.id),
        type: General.DM_CHANNEL,
    };

    const channels = {
        [channel1.id]: channel1,
        [channel2.id]: channel2,
        [channel3.id]: channel3,
    };

    const profiles = {
        [user1.id]: user1,
        [user2.id]: user2,
        [user3.id]: user3,
    };

    const profilesInChannel = {
        [channel1.id]: new Set([user1.id, user2.id, user3.id]),
        [channel2.id]: new Set([user1.id, user2.id]),
        [channel3.id]: new Set([user1.id, user3.id]),
    };

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            users: {
                currentUserId: user1.id,
                profiles,
                profilesInChannel,
            },
            channels: {
                channels,
            },
            preferences: {
                myPreferences: {},
            },
            general: {
                config: {},
            },
        },
    });

    it('will return no channels if there is no active user', () => {
        const state = {
            ...testState,
            entities: {
                ...testState.entities,
                users: {
                    ...testState.entities.users,
                    currentUserId: null,
                },
            },
        };

        assert.deepEqual(Selectors.getDirectAndGroupChannels(state), []);
    });

    it('will return only direct and group message channels', () => {
        const state = {
            ...testState,
            entities: {
                ...testState.entities,
                users: {
                    ...testState.entities.users,
                },
            },
        };

        assert.deepEqual(Selectors.getDirectAndGroupChannels(state), [
            {...channel1, display_name: [user2.username, user3.username].sort(sortUsernames).join(', ')},
            {...channel2, display_name: user2.username},
            {...channel3, display_name: user3.username},
        ]);
    });

    it('will not error out on undefined channels', () => {
        const state = {
            ...testState,
            entities: {
                ...testState.entities,
                users: {
                    ...testState.entities.users,
                },
                channels: {
                    ...testState.entities.channels,
                    channels: {
                        ...testState.entities.channels.channels,
                        ['undefined']: undefined, //eslint-disable-line no-useless-computed-key
                    },
                },
            },
        };

        assert.deepEqual(Selectors.getDirectAndGroupChannels(state), [
            {...channel1, display_name: [user2.username, user3.username].sort(sortUsernames).join(', ')},
            {...channel2, display_name: user2.username},
            {...channel3, display_name: user3.username},
        ]);
    });
});

describe('Selectors.Channels.getOrderedChannelIds', () => {
    const team1 = TestHelper.fakeTeamWithId();

    const channel1 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        type: General.OPEN_CHANNEL,
        last_post_at: 0,
    };
    const channel2 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        type: General.OPEN_CHANNEL,
        last_post_at: 0,
    };
    const channel3 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        type: General.OPEN_CHANNEL,
        last_post_at: 0,
    };
    const channel4 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        type: General.OPEN_CHANNEL,
        last_post_at: 0,
    };
    const channel5 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        type: General.OPEN_CHANNEL,
        last_post_at: 0,
    };

    const channels = {
        [channel1.id]: channel1,
        [channel2.id]: channel2,
        [channel3.id]: channel3,
        [channel4.id]: channel4,
        [channel5.id]: channel5,
    };

    const channelsInTeam = {
        [team1.id]: [channel1.id, channel2.id, channel3.id, channel4.id, channel5.id],
    };

    const user1 = TestHelper.fakeUserWithId();

    const profiles = {
        [user1.id]: user1,
    };

    const myChannelMembers = {
        [channel1.id]: {},
        [channel2.id]: {},
        [channel3.id]: {},
        [channel4.id]: {},
        [channel5.id]: {},
    };

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            teams: {
                currentTeamId: team1.id,
            },
            channels: {
                channels,
                myMembers: myChannelMembers,
                channelsInTeam,
            },
            users: {
                currentUserId: user1.id,
                profiles,
            },
            posts: {
                posts: {},
                postsInChannel: {},
            },
            preferences: {
                myPreferences: {},
            },
            general: {
                config: {},
            },
        },
    });
    it('get ordered channel ids by_type in current team strict equal', () => {
        const chan5 = {...testState.entities.channels.channels[channel5.id]};
        chan5.header = 'This should not change the results';

        const sidebarPrefs = {
            grouping: 'by_type',
            sorting: 'alpha',
            unreads_at_top: 'true',
            favorite_at_top: 'true',
        };

        const modifiedState = {
            ...testState,
            entities: {
                ...testState.entities,
                channels: {
                    ...testState.entities.channels,
                    channels: {
                        ...testState.entities.channels.channels,
                        [channel5.id]: chan5,
                    },
                },
            },
        };

        const fromOriginalState = Selectors.getOrderedChannelIds(
            testState,
            null,
            sidebarPrefs.grouping,
            sidebarPrefs.sorting,
            sidebarPrefs.unreads_at_top === 'true',
            sidebarPrefs.favorite_at_top === 'true',
        );

        const fromModifiedState = Selectors.getOrderedChannelIds(
            modifiedState,
            null,
            sidebarPrefs.grouping,
            sidebarPrefs.sorting,
            sidebarPrefs.unreads_at_top === 'true',
            sidebarPrefs.favorite_at_top === 'true',
        );

        assert.deepEqual(fromOriginalState, fromModifiedState);

        chan5.total_msg_count = 10;

        const unreadChannelState = {
            ...modifiedState,
            entities: {
                ...modifiedState.entities,
                channels: {
                    ...modifiedState.entities.channels,
                    channels: {
                        ...modifiedState.entities.channels.channels,
                        [channel5.id]: chan5,
                    },
                    myMembers: {
                        ...modifiedState.entities.channels.myMembers,
                        [channel5.id]: {
                            ...modifiedState.entities.channels.myMembers[channel5.id],
                            mention_count: 1,
                        },
                    },
                },
            },
        };

        const fromUnreadState = Selectors.getOrderedChannelIds(
            unreadChannelState,
            null,
            sidebarPrefs.grouping,
            sidebarPrefs.sorting,
            sidebarPrefs.unreads_at_top === 'true',
            sidebarPrefs.favorite_at_top === 'true',
        );

        assert.notDeepEqual(fromModifiedState, fromUnreadState);

        const favoriteChannelState = {
            ...modifiedState,
            entities: {
                ...modifiedState.entities,
                preferences: {
                    ...modifiedState.entities.preferences,
                    [`${Preferences.CATEGORY_FAVORITE_CHANNEL}--${channel4.id}`]: {
                        name: channel4.id,
                        category: Preferences.CATEGORY_FAVORITE_CHANNEL,
                        value: 'true',
                    },
                },
            },
        };

        const fromFavoriteState = Selectors.getOrderedChannelIds(
            favoriteChannelState,
            null,
            sidebarPrefs.grouping,
            sidebarPrefs.sorting,
            sidebarPrefs.unreads_at_top === 'true',
            sidebarPrefs.favorite_at_top === 'true',
        );

        assert.notDeepEqual(fromUnreadState, fromFavoriteState);
    });

    it('get ordered channel ids by recency order in current team strict equal', () => {
        const chan2 = {...testState.entities.channels.channels[channel2.id]};
        chan2.header = 'This should not change the results';

        const sidebarPrefs = {
            grouping: 'never',
            sorting: 'recent',
            unreads_at_top: 'false',
            favorite_at_top: 'false',
        };

        const modifiedState = {
            ...testState,
            entities: {
                ...testState.entities,
                channels: {
                    ...testState.entities.channels,
                    channels: {
                        ...testState.entities.channels.channels,
                        [channel2.id]: chan2,
                    },
                },
            },
        };

        const fromOriginalState = Selectors.getOrderedChannelIds(
            testState,
            null,
            sidebarPrefs.grouping,
            sidebarPrefs.sorting,
            sidebarPrefs.unreads_at_top === 'true',
            sidebarPrefs.favorite_at_top === 'true',
        );

        const fromModifiedState = Selectors.getOrderedChannelIds(
            modifiedState,
            null,
            sidebarPrefs.grouping,
            sidebarPrefs.sorting,
            sidebarPrefs.unreads_at_top === 'true',
            sidebarPrefs.favorite_at_top === 'true',
        );

        assert.deepEqual(fromOriginalState, fromModifiedState);

        chan2.last_post_at = (new Date()).getTime() + 500;
        const recencyInChan2State = {
            ...modifiedState,
            entities: {
                ...modifiedState.entities,
                channels: {
                    ...modifiedState.entities.channels,
                    channels: {
                        ...modifiedState.entities.channels.channels,
                        [chan2.id]: chan2,
                    },
                },
            },
        };

        const fromRecencyInChan2State = Selectors.getOrderedChannelIds(
            recencyInChan2State,
            null,
            sidebarPrefs.grouping,
            sidebarPrefs.sorting,
            sidebarPrefs.unreads_at_top === 'true',
            sidebarPrefs.favorite_at_top === 'true',
        );
        assert.notDeepEqual(fromModifiedState, fromRecencyInChan2State);
        assert.ok(fromRecencyInChan2State[0].items[0] === chan2.id);

        const chan3 = {...testState.entities.channels.channels[channel3.id]};
        chan3.last_post_at = (new Date()).getTime() + 500;
        const recencyInChan3State = {
            ...modifiedState,
            entities: {
                ...modifiedState.entities,
                channels: {
                    ...modifiedState.entities.channels,
                    channels: {
                        ...modifiedState.entities.channels.channels,
                        [channel1.id]: chan3,
                    },
                },
            },
        };

        const fromRecencyInChan3State = Selectors.getOrderedChannelIds(
            recencyInChan3State,
            null,
            sidebarPrefs.grouping,
            sidebarPrefs.sorting,
            sidebarPrefs.unreads_at_top === 'true',
            sidebarPrefs.favorite_at_top === 'true',
        );

        assert.notDeepEqual(fromRecencyInChan2State, fromRecencyInChan3State);
        assert.ok(fromRecencyInChan3State[0].items[0] === chan3.id);
    });
});

describe('Selectors.Channels.canManageAnyChannelMembersInCurrentTeam', () => {
    const team1 = TestHelper.fakeTeamWithId();

    const channel1 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        type: General.OPEN_CHANNEL,
    };
    const channel2 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        type: General.PRIVATE_CHANNEL,
    };

    const channels = {
        [channel1.id]: channel1,
        [channel2.id]: channel2,
    };

    const user1 = TestHelper.fakeUserWithId();

    const profiles = {
        [user1.id]: user1,
    };

    const myChannelMembers = {
        [channel1.id]: {},
        [channel2.id]: {},
    };

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            teams: {
                currentTeamId: team1.id,
            },
            channels: {
                channels,
                myMembers: myChannelMembers,
            },
            users: {
                profiles,
                currentUserId: user1.id,
            },
            preferences: {
                myPreferences: {},
            },
            general: {
                config: {},
            },
        },
    });

    it('will return false if channel_user does not have permissions to manage channel members', () => {
        const newState = {
            entities: {
                ...testState.entities,
                roles: {
                    roles: {
                        channel_user: {
                            permissions: [],
                        },
                    },
                },
                channels: {
                    ...testState.entities.channels,
                    myMembers: {
                        ...testState.entities.channels.myMembers,
                        [channel1.id]: {
                            ...testState.entities.channels.myMembers[channel1.id],
                            roles: 'channel_user',
                        },
                        [channel2.id]: {
                            ...testState.entities.channels.myMembers[channel2.id],
                            roles: 'channel_user',
                        },
                    },
                },
            },
        };

        assert.ok(Selectors.canManageAnyChannelMembersInCurrentTeam(newState) === false);
    });

    it('will return true if channel_user has permissions to manage public channel members', () => {
        const newState = {
            entities: {
                ...testState.entities,
                roles: {
                    roles: {
                        channel_user: {
                            permissions: ['manage_public_channel_members'],
                        },
                    },
                },
                channels: {
                    ...testState.entities.channels,
                    myMembers: {
                        ...testState.entities.channels.myMembers,
                        [channel1.id]: {
                            ...testState.entities.channels.myMembers[channel1.id],
                            roles: 'channel_user',
                        },
                        [channel2.id]: {
                            ...testState.entities.channels.myMembers[channel2.id],
                            roles: 'channel_user',
                        },
                    },
                },
            },
        };

        assert.ok(Selectors.canManageAnyChannelMembersInCurrentTeam(newState) === true);
    });

    it('will return true if channel_user has permissions to manage private channel members', () => {
        const newState = {
            entities: {
                ...testState.entities,
                roles: {
                    roles: {
                        channel_user: {
                            permissions: ['manage_private_channel_members'],
                        },
                    },
                },
                channels: {
                    ...testState.entities.channels,
                    myMembers: {
                        ...testState.entities.channels.myMembers,
                        [channel1.id]: {
                            ...testState.entities.channels.myMembers[channel1.id],
                            roles: 'channel_user',
                        },
                        [channel2.id]: {
                            ...testState.entities.channels.myMembers[channel2.id],
                            roles: 'channel_user',
                        },
                    },
                },
            },
        };

        assert.ok(Selectors.canManageAnyChannelMembersInCurrentTeam(newState) === true);
    });

    it('will return false if channel admins have permissions, but the user is not a channel admin of any channel', () => {
        const newState = {
            entities: {
                ...testState.entities,
                roles: {
                    roles: {
                        channel_admin: {
                            permissions: ['manage_public_channel_members'],
                        },
                    },
                },
                channels: {
                    ...testState.entities.channels,
                    myMembers: {
                        ...testState.entities.channels.myMembers,
                        [channel1.id]: {
                            ...testState.entities.channels.myMembers[channel1.id],
                            roles: 'channel_user',
                        },
                        [channel2.id]: {
                            ...testState.entities.channels.myMembers[channel2.id],
                            roles: 'channel_user',
                        },
                    },
                },
            },
        };

        assert.ok(Selectors.canManageAnyChannelMembersInCurrentTeam(newState) === false);
    });

    it('will return true if channel admins have permission, and the user is a channel admin of some channel', () => {
        const newState = {
            entities: {
                ...testState.entities,
                roles: {
                    roles: {
                        channel_admin: {
                            permissions: ['manage_public_channel_members'],
                        },
                    },
                },
                channels: {
                    ...testState.entities.channels,
                    myMembers: {
                        ...testState.entities.channels.myMembers,
                        [channel1.id]: {
                            ...testState.entities.channels.myMembers[channel1.id],
                            roles: 'channel_user channel_admin',
                        },
                        [channel2.id]: {
                            ...testState.entities.channels.myMembers[channel2.id],
                            roles: 'channel_user',
                        },
                    },
                },
            },
        };

        assert.ok(Selectors.canManageAnyChannelMembersInCurrentTeam(newState) === true);
    });

    it('will return true if team admins have permission, and the user is a team admin', () => {
        const newState = {
            entities: {
                ...testState.entities,
                roles: {
                    roles: {
                        team_admin: {
                            permissions: ['manage_public_channel_members'],
                        },
                    },
                },
                users: {
                    ...testState.entities.users,
                    profiles: {
                        ...testState.entities.users.profiles,
                        [user1.id]: {
                            ...testState.entities.users.profiles[user1.id],
                            roles: 'team_admin',
                        },
                    },
                },
            },
        };

        assert.ok(Selectors.canManageAnyChannelMembersInCurrentTeam(newState) === true);
    });
});

describe('Selectors.Channels.getSortedPrivateChannelIds', () => {
    const team1 = TestHelper.fakeTeamWithId();

    const channel1 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        type: General.PRIVATE_CHANNEL,
        display_name: 'DEF',
    };
    const channel2 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        type: General.PRIVATE_CHANNEL,
        display_name: 'GHI',
    };

    const channels = {
        [channel1.id]: channel1,
        [channel2.id]: channel2,
    };

    const channelsInTeam = {
        [team1.id]: [channel1.id, channel2.id],
    };

    const myChannelMembers = {
        [channel1.id]: {},
        [channel2.id]: {},
    };

    const user1 = TestHelper.fakeUserWithId();

    const profiles = {
        [user1.id]: user1,
    };

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            teams: {
                currentTeamId: team1.id,
            },
            channels: {
                channels,
                channelsInTeam,
                myMembers: myChannelMembers,
            },
            users: {
                currentUserId: user1.id,
                profiles,
            },
            posts: {
                posts: {},
                postsInChannel: {},
            },
            preferences: {
                myPreferences: {},
            },
            general: {
                config: {},
            },
        },
    });
    it('get sorted private channel ids in current team strict equal', () => {
        const chan2 = {...testState.entities.channels.channels[channel2.id]};
        chan2.header = 'This should not change the results';

        const modifiedState = {
            ...testState,
            entities: {
                ...testState.entities,
                channels: {
                    ...testState.entities.channels,
                    channels: {
                        ...testState.entities.channels.channels,
                        [channel2.id]: chan2,
                    },
                },
            },
        };

        const fromOriginalState = Selectors.getSortedPrivateChannelIds(testState);
        const fromModifiedState = Selectors.getSortedPrivateChannelIds(modifiedState);

        assert.ok(fromOriginalState === fromModifiedState);
        assert.ok(fromModifiedState[0] === channel1.id);

        chan2.display_name = 'abc';
        const updateState = {
            ...modifiedState,
            entities: {
                ...modifiedState.entities,
                channels: {
                    ...modifiedState.entities.channels,
                    channels: {
                        ...modifiedState.entities.channels.channels,
                        [channel2.id]: chan2,
                    },
                },
            },
        };

        const fromUpdateState = Selectors.getSortedPrivateChannelIds(updateState);
        assert.ok(fromModifiedState !== fromUpdateState);
        assert.ok(fromUpdateState[0] === channel2.id);
    });
});

describe('Selectors.Channels.getSortedPublicChannelIds', () => {
    const team1 = TestHelper.fakeTeamWithId();

    const channel1 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        display_name: 'DEF',
    };
    const channel2 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        display_name: 'GHI',
    };

    const channels = {
        [channel1.id]: channel1,
        [channel2.id]: channel2,
    };

    const channelsInTeam = {
        [team1.id]: [channel1.id, channel2.id],
    };

    const myChannelMembers = {
        [channel1.id]: {},
        [channel2.id]: {},
    };

    const user1 = TestHelper.fakeUserWithId();

    const profiles = {
        [user1.id]: user1,
    };

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            teams: {
                currentTeamId: team1.id,
            },
            channels: {
                channels,
                channelsInTeam,
                myMembers: myChannelMembers,
            },
            users: {
                currentUserId: user1.id,
                profiles,
            },
            posts: {
                posts: {},
                postsInChannel: {},
            },
            preferences: {
                myPreferences: {},
            },
            general: {
                config: {},
            },
        },
    });
    it('get sorted public channel ids in current team strict equal', () => {
        const chan2 = {...testState.entities.channels.channels[channel2.id]};
        chan2.header = 'This should not change the results';

        const modifiedState = {
            ...testState,
            entities: {
                ...testState.entities,
                channels: {
                    ...testState.entities.channels,
                    channels: {
                        ...testState.entities.channels.channels,
                        [channel2.id]: chan2,
                    },
                },
            },
        };

        const fromOriginalState = Selectors.getSortedPublicChannelIds(testState);
        const fromModifiedState = Selectors.getSortedPublicChannelIds(modifiedState);

        assert.ok(fromOriginalState === fromModifiedState);
        assert.ok(fromModifiedState[0] === channel1.id);

        chan2.display_name = 'abc';
        const updateState = {
            ...modifiedState,
            entities: {
                ...modifiedState.entities,
                channels: {
                    ...modifiedState.entities.channels,
                    channels: {
                        ...modifiedState.entities.channels.channels,
                        [channel2.id]: chan2,
                    },
                },
            },
        };

        const fromUpdateState = Selectors.getSortedPublicChannelIds(updateState);
        assert.ok(fromModifiedState !== fromUpdateState);
        assert.ok(fromUpdateState[0] === channel2.id);
    });
});

describe('Selectors.Channels.getSortedFavoriteChannelIds', () => {
    const team1 = TestHelper.fakeTeamWithId();

    const channel1 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        display_name: 'DEF',
    };
    const channel2 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        display_name: 'GHI',
    };

    const channels = {
        [channel1.id]: channel1,
        [channel2.id]: channel2,
    };

    const channelsInTeam = {
        [team1.id]: [channel1.id, channel2.id],
    };

    const myChannelMembers = {
        [channel1.id]: {notify_props: {}},
        [channel2.id]: {notify_props: {}},
    };

    const user1 = TestHelper.fakeUserWithId();

    const profiles = {
        [user1.id]: user1,
    };

    const myPreferences = {
        [`${Preferences.CATEGORY_FAVORITE_CHANNEL}--${channel1.id}`]: {
            name: channel1.id,
            value: 'true',
        },
        [`${Preferences.CATEGORY_FAVORITE_CHANNEL}--${channel2.id}`]: {
            name: channel2.id,
            value: 'true',
        },
    };

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            teams: {
                currentTeamId: team1.id,
            },
            channels: {
                channels,
                channelsInTeam,
                myMembers: myChannelMembers,
            },
            users: {
                currentUserId: user1.id,
                profiles,
            },
            posts: {
                posts: {},
                postsInChannel: {},
            },
            preferences: {
                myPreferences,
            },
            general: {
                config: {},
            },
        },
    });

    it('get sorted favorite channel ids in current team strict equal', () => {
        const chan1 = {...testState.entities.channels.channels[channel1.id]};
        chan1.total_msg_count = 10;

        const modifiedState = {
            ...testState,
            entities: {
                ...testState.entities,
                channels: {
                    ...testState.entities.channels,
                    channels: {
                        ...testState.entities.channels.channels,
                        [channel1.id]: chan1,
                    },
                },
            },
        };

        const fromOriginalState = Selectors.getSortedFavoriteChannelIds(testState);
        const fromModifiedState = Selectors.getSortedFavoriteChannelIds(modifiedState);

        assert.ok(fromOriginalState === fromModifiedState);
        assert.ok(fromModifiedState[0] === channel1.id);

        const chan2 = {...testState.entities.channels.channels[channel2.id]};
        chan2.display_name = 'abc';

        const updateState = {
            ...modifiedState,
            entities: {
                ...modifiedState.entities,
                channels: {
                    ...modifiedState.entities.channels,
                    channels: {
                        ...modifiedState.entities.channels.channels,
                        [channel2.id]: chan2,
                    },
                },
            },
        };

        const fromUpdateState = Selectors.getSortedFavoriteChannelIds(updateState);
        assert.ok(fromModifiedState !== fromUpdateState);
        assert.ok(fromUpdateState[0] === channel2.id);
    });
});

describe('Selectors.Channels.getSortedUnreadChannelIds', () => {
    const team1 = TestHelper.fakeTeamWithId();

    const channel1 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        display_name: 'DEF',
    };
    const channel2 = TestHelper.fakeChannelWithId(team1.id);
    const channel3 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        display_name: 'ABC',
    };

    const channels = {
        [channel1.id]: channel1,
        [channel2.id]: channel2,
        [channel3.id]: channel3,
    };

    const channelsInTeam = {
        [team1.id]: [channel1.id, channel2.id, channel3.id],
    };

    const myChannelMembers = {
        [channel1.id]: {mention_count: 1, msg_count: 0, notify_props: {}},
        [channel2.id]: {mention_count: 0, msg_count: 0, notify_props: {}},
        [channel3.id]: {mention_count: 0, msg_count: 0, notify_props: {}},
    };

    const user1 = TestHelper.fakeUserWithId();

    const profiles = {
        [user1.id]: user1,
    };

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            teams: {
                currentTeamId: team1.id,
            },
            channels: {
                channels,
                myMembers: myChannelMembers,
                channelsInTeam,
            },
            users: {
                currentUserId: user1.id,
                profiles,
            },
            posts: {
                posts: {},
                postsInChannel: {},
            },
            preferences: {
                myPreferences: {},
            },
            general: {
                config: {},
            },
        },
    });

    it('get sorted unread channel ids in current team strict equal', () => {
        const chan1 = {...testState.entities.channels.channels[channel1.id]};
        chan1.total_msg_count = 10;

        const modifiedState = {
            ...testState,
            entities: {
                ...testState.entities,
                channels: {
                    ...testState.entities.channels,
                    channels: {
                        ...testState.entities.channels.channels,
                        [channel1.id]: chan1,
                    },
                },
            },
        };

        // When adding a mention to channel3 with display_name 'ABC' states are !== and channel3 is above all others
        const mentionState = {
            ...modifiedState,
            entities: {
                ...modifiedState.entities,
                channels: {
                    ...modifiedState.entities.channels,
                    myMembers: {
                        ...modifiedState.entities.channels.myMembers,
                        [channel3.id]: {
                            ...modifiedState.entities.channels.myMembers[channel3.id],
                            mention_count: 1,
                        },
                    },
                },
            },
        };

        const fromOriginalState = Selectors.getSortedUnreadChannelIds(testState);
        const fromModifiedState = Selectors.getSortedUnreadChannelIds(modifiedState);
        const fromMentionState = Selectors.getSortedUnreadChannelIds(mentionState);

        // mentions should be prioritized to the top
        assert.ok(fromOriginalState === fromModifiedState);
        assert.ok(fromMentionState !== fromModifiedState);

        // channel3 and channel1 are above all others
        // since default order is "alpha", channel3 with display_name "ABC" should come first
        assert.ok(fromMentionState[0] === channel3.id);

        // followed by channel1 with display_name "DEF"
        assert.ok(fromMentionState[1] === channel1.id);

        const hasMentionMutedChannelState = {
            ...mentionState,
            entities: {
                ...mentionState.entities,
                channels: {
                    ...mentionState.entities.channels,
                    myMembers: {
                        ...mentionState.entities.channels.myMembers,
                        [channel3.id]: {
                            mention_count: 1,
                            notify_props: {
                                mark_unread: 'mention',
                            },
                        },
                    },
                },
            },
        };

        const fromHasMentionMutedChannelState = Selectors.getSortedUnreadChannelIds(hasMentionMutedChannelState);

        // For channels with mentions, non-muted channel1 should come first before muted channel3.
        assert.ok(fromHasMentionMutedChannelState[0] === channel1.id);
        assert.ok(fromHasMentionMutedChannelState[1] === channel3.id);
    });
});

describe('Selectors.Channels.getUnreadChannelIds', () => {
    const user1 = TestHelper.fakeUserWithId();
    user1.username = 'user';
    const user2 = TestHelper.fakeUserWithId();
    user2.username = 'user2';
    const user3 = TestHelper.fakeUserWithId();
    user3.username = 'user3';
    const fakeUser = TestHelper.fakeUserWithId('fakeUserId');
    fakeUser.username = 'fakeUser';
    const profiles = {
        [fakeUser.id]: fakeUser,
        [user1.id]: user1,
        [user2.id]: user2,
        [user3.id]: user3,
    };

    const team1 = TestHelper.fakeTeamWithId();
    const channel1 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        display_name: 'ABC',
        total_msg_count: 2,
    };
    const channel2 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        display_name: 'DEF',
    };
    const channel3 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        display_name: 'GHI',
        total_msg_count: 2,
    };
    const channel4 = {
        ...TestHelper.fakeChannelWithId(''),
        display_name: [user1.username, user2.username, user3.username].join(', '),
        type: General.GM_CHANNEL,
        total_msg_count: 3,
        last_post_at: Date.now(),
    };
    const channel5 = {
        ...TestHelper.fakeDmChannel(user1.id, 'fakeUserId'),
        total_msg_count: 3,
    };

    const channels = {
        [channel1.id]: channel1,
        [channel2.id]: channel2,
        [channel3.id]: channel3,
        [channel4.id]: channel4,
        [channel5.id]: channel5,
    };

    const channelsInTeam = {
        [team1.id]: [channel1.id, channel2.id, channel3.id],
        // eslint-disable-next-line no-useless-computed-key
        ['']: [channel4.id],
    };

    const myChannelMembers = {
        [channel1.id]: {mention_count: 0, msg_count: 1, notify_props: {}},
        [channel2.id]: {mention_count: 1, msg_count: 1, notify_props: {}},
        [channel3.id]: {mention_count: 1, msg_count: 0, notify_props: {}},
        [channel4.id]: {mention_count: 0, msg_count: 2, notify_props: {}},
        [channel5.id]: {mention_count: 2, msg_count: 3, notify_props: {}},
    };
    const membersInChannel = {
        [channel4.id]: {
            [user1.id]: {channel_id: channel4.id, user_id: user1.id},
        },
    };

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            teams: {
                currentTeamId: team1.id,
            },
            channels: {
                channels,
                myMembers: myChannelMembers,
                channelsInTeam,
                membersInChannel,
            },
            users: {
                currentUserId: user1.id,
                profiles,
                profilesInChannel: {
                    [channel4.id]: null,
                },
            },
            posts: {
                posts: {},
                postsInChannel: {},
            },
            preferences: {
                myPreferences: {},
            },
            general: {
                config: {},
            },
        },
    });

    test('channels should be sorted alphabetically with mentions coming first', () => {
        expect(Selectors.getSortedUnreadChannelIds(testState)).toEqual([
            channel2.id, // has mention and display name is "DEF"
            channel3.id, // has mention and display name is "GHI"
            channel1.id, // has unread and display name is "ABC"
            channel4.id, // has unread and display name is "user, user2, user3"
        ]);

        const modifiedState = {
            ...testState,
            entities: {
                ...testState.entities,
                channels: {
                    ...testState.entities.channels,
                    myMembers: {
                        ...testState.entities.channels.myMembers,
                        [channel1.id]: {
                            ...testState.entities.channels.myMembers[channel1.id],
                            mention_count: 1,
                        },
                    },
                },
            },
        };

        expect(Selectors.getSortedUnreadChannelIds(modifiedState)).toEqual([
            channel1.id, // has mention and display name is "ABC"
            channel2.id, // has mention and display name is "DEF"
            channel3.id, // has mention and display name is "GHI"
            channel4.id, // has unread and display name is "user, user2, user3"
        ]);
    });

    test('selector should return the same array as long as the order stays the same', () => {
        const fromOriginalState = Selectors.getSortedUnreadChannelIds(testState);

        // Adding messages to an already unread channel shouldn't change the order
        let modifiedState = {
            ...testState,
            entities: {
                ...testState.entities,
                channels: {
                    ...testState.entities.channels,
                    channels: {
                        ...testState.entities.channels.channels,
                        [channel2.id]: {
                            ...testState.entities.channels.channels[channel2.id],
                            total_msg_count: 10,
                        },
                    },
                },
            },
        };

        expect(Selectors.getSortedUnreadChannelIds(modifiedState)).toBe(fromOriginalState);

        // Adding a mention to a channel that didn't have mentions before should change the order
        modifiedState = {
            ...modifiedState,
            entities: {
                ...modifiedState.entities,
                channels: {
                    ...modifiedState.entities.channels,
                    myMembers: {
                        ...modifiedState.entities.channels.myMembers,
                        [channel4.id]: {
                            ...modifiedState.entities.channels.myMembers[channel4.id],
                            mention_count: 1,
                        },
                    },
                },
            },
        };

        expect(Selectors.getSortedUnreadChannelIds(modifiedState)).not.toBe(fromOriginalState);
    });
});

describe('Selectors.Channels.getUnreadChannelIds', () => {
    const team1 = TestHelper.fakeTeamWithId();

    const channel1 = TestHelper.fakeChannelWithId(team1.id);
    const channel2 = TestHelper.fakeChannelWithId(team1.id);

    const channels = {
        [channel1.id]: channel1,
        [channel2.id]: channel2,
    };

    const channelsInTeam = {
        [team1.id]: [channel1.id, channel2.id],
    };

    const myChannelMembers = {
        [channel1.id]: {},
        [channel2.id]: {},
    };

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            general: {
                config: {},
            },
            preferences: {
                myPreferences: {},
            },
            teams: {
                currentTeamId: team1.id,
            },
            channels: {
                channels,
                channelsInTeam,
                myMembers: myChannelMembers,
            },
        },
    });
    it('get unread channel ids in current team strict equal', () => {
        const chan2 = {...testState.entities.channels.channels[channel2.id]};
        chan2.total_msg_count = 10;

        const modifiedState = {
            ...testState,
            entities: {
                ...testState.entities,
                channels: {
                    ...testState.entities.channels,
                    channels: {
                        ...testState.entities.channels.channels,
                        [channel2.id]: chan2,
                    },
                },
            },
        };

        const fromOriginalState = Selectors.getUnreadChannelIds(testState);
        const fromModifiedState = Selectors.getUnreadChannelIds(modifiedState);

        assert.ok(fromOriginalState === fromModifiedState);
    });

    it('get unread channel ids in current team and keep specified channel as unread', () => {
        const chan2 = {...testState.entities.channels.channels[channel2.id]};
        chan2.total_msg_count = 10;

        const modifiedState = {
            ...testState,
            entities: {
                ...testState.entities,
                channels: {
                    ...testState.entities.channels,
                    channels: {
                        ...testState.entities.channels.channels,
                        [channel2.id]: chan2,
                    },
                },
            },
        };

        const fromOriginalState = Selectors.getUnreadChannelIds(testState);
        const fromModifiedState = Selectors.getUnreadChannelIds(modifiedState, {id: channel1.id});

        assert.ok(fromOriginalState !== fromModifiedState);
        assert.ok(fromModifiedState.includes(channel1.id));
    });
});

describe('Selectors.channels.getAllRecentChannels', () => {
    const team1 = TestHelper.fakeTeamWithId();
    const team2 = TestHelper.fakeTeamWithId();

    const channel1 = TestHelper.fakeChannelWithId(team1.id);
    const channel2 = TestHelper.fakeChannelWithId(team1.id);

    const channels = {
        [channel1.id]: channel1,
        [channel2.id]: channel2,
    };

    const channelsInTeam = {
        [team1.id]: [channel1.id, channel2.id],
        [team2.id]: [channel1.id, channel2.id],
    };

    const myChannelMembers = {
        [channel1.id]: {},
        [channel2.id]: {},
    };

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            teams: {
                currentTeamId: team1.id,
            },
            users: {
                currentUserId: TestHelper.generateId(),
                profiles: {},
            },
            channels: {
                channels,
                channelsInTeam,
                myMembers: myChannelMembers,
            },
            posts: {
                posts: {},
                postsInChannel: {},
            },
            general: {
                config: {},
            },
            preferences: {
                myPreferences: {},
            },
        },
    });
    it('get all recent channels in current team strict equal', () => {
        const newChannel = TestHelper.fakeChannelWithId(team2.id);

        const modifiedState = {
            ...testState,
            entities: {
                ...testState.entities,
                channels: {
                    ...testState.entities.channels,
                    channelsInTeam: {
                        ...testState.entities.channels.channelsInTeam,
                        [team2.id]: [
                            ...testState.entities.channels.channelsInTeam[team2.id],
                            newChannel.id,
                        ],
                    },
                },
            },
        };

        const fromOriginalState = Selectors.getAllChannels(testState);
        const fromModifiedState = Selectors.getAllChannels(modifiedState);

        assert.ok(fromOriginalState === fromModifiedState);
    });

    it('get all recent channels in current team and keep specified channel as unread', () => {
        const chan2 = {...testState.entities.channels.channels[channel2.id]};
        chan2.total_msg_count = 10;

        const modifiedState = {
            ...testState,
            entities: {
                ...testState.entities,
                channels: {
                    ...testState.entities.channels,
                    channels: {
                        ...testState.entities.channels.channels,
                        [channel2.id]: chan2,
                    },
                },
            },
        };

        const fromOriginalState = Selectors.getAllRecentChannels(testState);
        const fromModifiedState = Selectors.getAllRecentChannels(modifiedState, {id: channel1.id});

        assert.ok(fromOriginalState !== fromModifiedState);
    });
});

describe('Selectors.Channels.getDirectChannelIds', () => {
    const team1 = TestHelper.fakeTeamWithId();

    const user1 = TestHelper.fakeUserWithId();

    const profiles = {
        [user1.id]: user1,
    };

    const channel1 = TestHelper.fakeChannelWithId(team1.id);
    const channel2 = TestHelper.fakeChannelWithId(team1.id);

    const channels = {
        [channel1.id]: channel1,
        [channel2.id]: channel2,
    };

    const myChannelMembers = {
        [channel1.id]: {},
        [channel2.id]: {},
    };

    const profilesInChannel = {
        [channel1.id]: new Set([user1.id]),
        [channel2.id]: new Set([user1.id]),
    };

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            channels: {
                channels,
                myMembers: myChannelMembers,
            },
            users: {
                currentUserId: user1.id,
                profiles,
                profilesInChannel,
            },
            posts: {
                posts: {},
                postsInChannel: {},
            },
            preferences: {
                myPreferences: {},
            },
            general: {
                config: {},
            },
        },
    });
    it('get direct channel ids strict equal', () => {
        const chan1 = {...testState.entities.channels.channels[channel1.id]};
        chan1.total_msg_count += 1; // no reason to set it to 1, this is just to make sure the state changed

        const modifiedState = {
            ...testState,
            entities: {
                ...testState.entities,
                channels: {
                    ...testState.entities.channels,
                    channels: {
                        ...testState.entities.channels.channels,
                        [channel1.id]: chan1,
                    },
                },
            },
        };

        const fromOriginalState = Selectors.getDirectChannelIds(testState);
        const fromModifiedState = Selectors.getDirectChannelIds(modifiedState);

        assert.ok(fromOriginalState === fromModifiedState);

        // it should't have a channel that belongs to a team
        assert.equal(fromModifiedState.includes(channel1.id), false, 'should not have a channel that belongs to a team');
    });

    it('get direct channel ids for channels with non-null values', () => {
        const dmChannel1 = TestHelper.fakeDmChannel(user1.id, 'fakeUserId1');
        const dmChannel2 = TestHelper.fakeDmChannel(user1.id, 'fakeUserId2');

        const modifiedState = {
            ...testState,
            entities: {
                ...testState.entities,
                channels: {
                    ...testState.entities.channels,
                    channels: {
                        ...testState.entities.channels.channels,
                        [dmChannel1.id]: dmChannel1,
                        [dmChannel2.id]: null,
                    },
                },
                preferences: {
                    ...testState.entities.preferences,
                    myPreferences: {
                        [`${Preferences.CATEGORY_DIRECT_CHANNEL_SHOW}--${dmChannel1.teammate_id}`]: {
                            category: Preferences.CATEGORY_DIRECT_CHANNEL_SHOW,
                            name: dmChannel1.teammate_id,
                            value: 'true',
                        },
                        [`${Preferences.CATEGORY_DIRECT_CHANNEL_SHOW}--${dmChannel2.teammate_id}`]: {
                            category: Preferences.CATEGORY_DIRECT_CHANNEL_SHOW,
                            name: dmChannel2.teammate_id,
                            value: 'true',
                        },
                    },
                },
            },
        };

        const fromModifiedState = Selectors.getDirectChannelIds(modifiedState);
        assert.equal(fromModifiedState.length, 1);
        assert.equal(fromModifiedState[0], dmChannel1.id);
    });
});

describe('Selectors.Channels.getUnreadStatusInCurrentTeam', () => {
    const team1 = TestHelper.fakeTeamWithId();

    const channel1 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        total_msg_count: 2,
    };
    const channel2 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        total_msg_count: 8,
    };
    const channel3 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        total_msg_count: 5,
    };

    const channels = {
        [channel1.id]: channel1,
        [channel2.id]: channel2,
        [channel3.id]: channel3,
    };

    const myChannelMembers = {
        [channel1.id]: {notify_props: {}, mention_count: 1, msg_count: 0},
        [channel2.id]: {notify_props: {}, mention_count: 4, msg_count: 0},
        [channel3.id]: {notify_props: {}, mention_count: 4, msg_count: 5},
    };

    const channelsInTeam = {
        [team1.id]: [channel1.id, channel2.id],
    };

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            teams: {
                currentTeamId: team1.id,
            },
            threads: {
                counts: {},
            },
            channels: {
                currentChannelId: channel1.id,
                channels,
                channelsInTeam,
                myMembers: myChannelMembers,
            },
            users: {
                profiles: {},
            },
            preferences: {
                myPreferences: {},
            },
            general: {
                config: {},
            },
        },
    });

    it('get unreads for current team', () => {
        expect(Selectors.getUnreadStatusInCurrentTeam(testState)).toEqual(4);
    });

    it('get unreads for current read channel', () => {
        const testState2 = {...testState,
            entities: {...testState.entities,
                channels: {...testState.entities.channels,
                    currentChannelId: channel3.id,
                },
            },
        };
        expect(Selectors.countCurrentChannelUnreadMessages(testState2)).toEqual(0);
    });

    it('get unreads for current unread channel', () => {
        expect(Selectors.countCurrentChannelUnreadMessages(testState)).toEqual(2);
    });

    it('get unreads for channel not on members', () => {
        const testState2 = {...testState,
            entities: {...testState.entities,
                channels: {...testState.entities.channels,
                    currentChannelId: 'some_other_id',
                },
            },
        };
        expect(Selectors.countCurrentChannelUnreadMessages(testState2)).toEqual(0);
    });

    it('get unreads with a missing profile entity', () => {
        const newProfiles = {
            ...testState.entities.users.profiles,
        };
        Reflect.deleteProperty(newProfiles, 'fakeUserId');
        const newState = {
            ...testState,
            entities: {
                ...testState.entities,
                users: {
                    ...testState.entities.users,
                    profiles: newProfiles,
                },
            },
        };

        expect(Selectors.getUnreadStatusInCurrentTeam(newState)).toEqual(4);
    });

    it('get unreads with a deactivated user', () => {
        const newProfiles = {
            ...testState.entities.users.profiles,
            fakeUserId: {
                ...testState.entities.users.profiles.fakeUserId,
                delete_at: 100,
            },
        };

        const newState = {
            ...testState,
            entities: {
                ...testState.entities,
                users: {
                    ...testState.entities.users,
                    profiles: newProfiles,
                },
            },
        };
        expect(Selectors.getUnreadStatusInCurrentTeam(newState)).toEqual(4);
    });

    it('get unreads with a deactivated channel', () => {
        const newChannels = {
            ...testState.entities.channels.channels,
            [channel2.id]: {
                ...testState.entities.channels.channels[channel2.id],
                delete_at: 100,
            },
        };

        const newState = {
            ...testState,
            entities: {
                ...testState.entities,
                channels: {
                    ...testState.entities.channels,
                    channels: newChannels,
                },
            },
        };

        expect(Selectors.getUnreadStatusInCurrentTeam(newState)).toEqual(false);
    });
});

describe('Selectors.Channels.getUnreadStatus', () => {
    const team1 = TestHelper.fakeTeamWithId();
    const team2 = TestHelper.fakeTeamWithId();

    const teams = {
        [team1.id]: team1,
        [team2.id]: team2,
    };

    const myTeamMembers = {
        [team1.id]: {mention_count: 16, msg_count: 32},
        [team2.id]: {mention_count: 64, msg_count: 128},
    };

    const channel1 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        total_msg_count: 2,
    };
    const channel2 = {
        ...TestHelper.fakeChannelWithId(team1.id),
        total_msg_count: 8,
    };

    const channels = {
        [channel1.id]: channel1,
        [channel2.id]: channel2,
    };

    const myChannelMembers = {
        [channel1.id]: {notify_props: {}, mention_count: 1, msg_count: 0},
        [channel2.id]: {notify_props: {}, mention_count: 4, msg_count: 0},
    };

    const testState = deepFreezeAndThrowOnMutation({
        entities: {
            threads: {
                counts: {},
            },
            preferences: {
                myPreferences: {},
            },
            general: {config: {}},
            teams: {
                currentTeamId: team1.id,
                teams,
                myMembers: myTeamMembers,
            },
            channels: {
                channels,
                myMembers: myChannelMembers,
            },
            users: {
                profiles: {},
            },
        },
    });

    it('get unreads', () => {
        expect(Selectors.getUnreadStatus(testState)).toBe(69);
    });

    it('get unreads with a missing profile entity', () => {
        const newProfiles = {
            ...testState.entities.users.profiles,
        };
        Reflect.deleteProperty(newProfiles, 'fakeUserId');
        const newState = {
            ...testState,
            entities: {
                ...testState.entities,
                users: {
                    ...testState.entities.users,
                    profiles: newProfiles,
                },
            },
        };

        expect(Selectors.getUnreadStatus(newState)).toBe(69);
    });

    it('get unreads with a deactivated user', () => {
        const newProfiles = {
            ...testState.entities.users.profiles,
            fakeUserId: {
                ...testState.entities.users.profiles.fakeUserId,
                delete_at: 100,
            },
        };

        const newState = {
            ...testState,
            entities: {
                ...testState.entities,
                users: {
                    ...testState.entities.users,
                    profiles: newProfiles,
                },
            },
        };
        expect(Selectors.getUnreadStatus(newState)).toBe(69);
    });

    it('get unreads with a deactivated channel', () => {
        const newChannels = {
            ...testState.entities.channels.channels,
            [channel2.id]: {
                ...testState.entities.channels.channels[channel2.id],
                delete_at: 100,
            },
        };

        const newState = {
            ...testState,
            entities: {
                ...testState.entities,
                channels: {
                    ...testState.entities.channels,
                    channels: newChannels,
                },
            },
        };

        expect(Selectors.getUnreadStatus(newState)).toBe(65);
    });
});

describe('Selectors.Channels.getUnreadStatus', () => {
    const team1 = {id: 'team1', delete_at: 0};
    const team2 = {id: 'team2', delete_at: 0};

    const channelA = {id: 'channelA', name: 'channelA', team_id: 'team1', total_msg_count: 11, delete_at: 0};
    const channelB = {id: 'channelB', name: 'channelB', team_id: 'team1', total_msg_count: 13, delete_at: 0};
    const channelC = {id: 'channelB', name: 'channelB', team_id: 'team2', total_msg_count: 17, delete_at: 0};

    const dmChannel = {id: 'dmChannel', name: 'user1__user2', team_id: '', total_msg_count: 11, delete_at: 0, type: General.DM_CHANNEL};
    const gmChannel = {id: 'gmChannel', name: 'gmChannel', team_id: 'team1', total_msg_count: 11, delete_at: 0, type: General.GM_CHANNEL};

    test('should return the correct number of messages and mentions from channels on the current team', () => {
        const myMemberA = {mention_count: 2, msg_count: 3, notify_props: {mark_unread: 'all'}};
        const myMemberB = {mention_count: 5, msg_count: 7, notify_props: {mark_unread: 'all'}};

        const state = {
            entities: {
                threads: {
                    counts: {},
                },
                preferences: {
                    myPreferences: {},
                },
                general: {config: {}},
                channels: {
                    channels: {
                        channelA,
                        channelB,
                    },
                    myMembers: {
                        channelA: myMemberA,
                        channelB: myMemberB,
                    },
                },
                teams: {
                    currentTeamId: 'team1',
                    myMembers: {},
                    teams: {
                        team1,
                    },
                },
                users: {
                    currentUserId: 'user1',
                    profiles: {},
                },
            },
        };

        const unreadStatus = Selectors.getUnreadStatus(state);
        const unreadMeta = Selectors.basicUnreadMeta(unreadStatus);

        expect(unreadMeta.isUnread).toBe(true); // channelA and channelB are unread
        expect(unreadMeta.unreadMentionCount).toBe(myMemberA.mention_count + myMemberB.mention_count);
    });

    test('should not count messages from channel with mark_unread set to "mention"', () => {
        const myMemberA = {mention_count: 2, msg_count: 3, notify_props: {mark_unread: 'mention'}};
        const myMemberB = {mention_count: 5, msg_count: 7, notify_props: {mark_unread: 'all'}};

        const state = {
            entities: {
                threads: {
                    counts: {},
                },
                preferences: {
                    myPreferences: {},
                },
                general: {config: {}},
                channels: {
                    channels: {
                        channelA,
                        channelB,
                    },
                    myMembers: {
                        channelA: myMemberA,
                        channelB: myMemberB,
                    },
                },
                teams: {
                    currentTeamId: 'team1',
                    myMembers: {},
                    teams: {
                        team1,
                    },
                },
                users: {
                    currentUserId: 'user1',
                    profiles: {},
                },
            },
        };

        const unreadStatus = Selectors.getUnreadStatus(state);
        const unreadMeta = Selectors.basicUnreadMeta(unreadStatus);

        expect(unreadMeta.isUnread).toBe(true); // channelA and channelB are unread, but only channelB is counted because of its mark_unread
        expect(unreadStatus).toBe(myMemberA.mention_count + myMemberB.mention_count);
    });

    test('should count mentions from DM channels', () => {
        const dmMember = {mention_count: 2, msg_count: 3, notify_props: {mark_unread: 'all'}};

        const state = {
            entities: {
                threads: {
                    counts: {},
                },
                preferences: {
                    myPreferences: {},
                },
                general: {config: {}},
                channels: {
                    channels: {
                        dmChannel,
                    },
                    myMembers: {
                        dmChannel: dmMember,
                    },
                },
                teams: {
                    currentTeamId: 'team1',
                    myMembers: {},
                    teams: {
                        team1,
                    },
                },
                users: {
                    currentUserId: 'user1',
                    profiles: {
                        user2: {delete_at: 0},
                    },
                },
            },
        };

        const unreadStatus = Selectors.getUnreadStatus(state);
        const unreadMeta = Selectors.basicUnreadMeta(unreadStatus);

        expect(unreadMeta.isUnread).toBe(true); // dmChannel is unread
        expect(unreadMeta.unreadMentionCount).toBe(dmMember.mention_count);
    });

    test('should not count mentions from DM channel with archived user', () => {
        const dmMember = {mention_count: 2, msg_count: 3, notify_props: {mark_unread: 'all'}};

        const state = {
            entities: {
                threads: {
                    counts: {},
                },
                preferences: {
                    myPreferences: {},
                },
                general: {config: {}},
                channels: {
                    channels: {
                        dmChannel,
                    },
                    myMembers: {
                        dmChannel: dmMember,
                    },
                },
                teams: {
                    currentTeamId: 'team1',
                    myMembers: {},
                    teams: {
                        team1,
                    },
                },
                users: {
                    currentUserId: 'user1',
                    profiles: {
                        user2: {delete_at: 1},
                    },
                },
            },
        };

        const unreadStatus = Selectors.getUnreadStatus(state);

        expect(unreadStatus).toBe(false);
    });

    test('should count mentions from GM channels', () => {
        const gmMember = {mention_count: 2, msg_count: 3, notify_props: {mark_unread: 'all'}};

        const state = {
            entities: {
                threads: {
                    counts: {},
                },
                general: {config: {}},
                preferences: {
                    myPreferences: {},
                },
                channels: {
                    channels: {
                        gmChannel,
                    },
                    myMembers: {
                        gmChannel: gmMember,
                    },
                },
                teams: {
                    currentTeamId: 'team1',
                    myMembers: {},
                    teams: {
                        team1,
                    },
                },
                users: {
                    currentUserId: 'user1',
                    profiles: {},
                },
            },
        };

        const unreadStatus = Selectors.getUnreadStatus(state);
        const unreadMeta = Selectors.basicUnreadMeta(unreadStatus);

        expect(unreadMeta.isUnread).toBe(true); // gmChannel is unread
        expect(unreadMeta.unreadMentionCount).toBe(gmMember.mention_count);
    });

    test('should count mentions and messages for other teams from team members', () => {
        const myMemberA = {mention_count: 2, msg_count: 3, notify_props: {mark_unread: 'all'}};
        const myMemberC = {mention_count: 5, msg_count: 7, notify_props: {mark_unread: 'all'}};

        const teamMember1 = {msg_count: 1, mention_count: 2};
        const teamMember2 = {msg_count: 3, mention_count: 6};

        const state = {
            entities: {
                general: {config: {}},
                preferences: {
                    myPreferences: {},
                },
                threads: {
                    counts: {},
                },
                channels: {
                    channels: {
                        channelA,
                        channelC,
                    },
                    myMembers: {
                        channelA: myMemberA,
                        channelC: myMemberC,
                    },
                },
                teams: {
                    currentTeamId: 'team1',
                    myMembers: {
                        team1: teamMember1,
                        team2: teamMember2,
                    },
                    teams: {
                        team1,
                        team2,
                    },
                },
                users: {
                    currentUserId: 'user1',
                    profiles: {},
                },
            },
        };

        const unreadStatus = Selectors.getUnreadStatus(state);
        const unreadMeta = Selectors.basicUnreadMeta(unreadStatus);

        expect(unreadMeta.isUnread).toBe(true); // channelA and channelC are unread
        expect(unreadMeta.unreadMentionCount).toBe(myMemberA.mention_count + teamMember2.mention_count);
    });
});

describe('Selectors.Channels.getMyFirstChannelForTeams', () => {
    test('should return the first channel in each team', () => {
        const state = {
            entities: {
                channels: {
                    channels: {
                        channelA: {id: 'channelA', name: 'channelA', team_id: 'team1'},
                        channelB: {id: 'channelB', name: 'channelB', team_id: 'team2'},
                        channelC: {id: 'channelC', name: 'channelC', team_id: 'team1'},
                    },
                    myMembers: {
                        channelA: {},
                        channelB: {},
                        channelC: {},
                    },
                },
                teams: {
                    myMembers: {
                        team1: {},
                        team2: {},
                    },
                    teams: {
                        team1: {id: 'team1', delete_at: 0},
                        team2: {id: 'team2', delete_at: 0},
                    },
                },
                users: {
                    currentUserId: 'user',
                    profiles: {
                        user: {},
                    },
                },
            },
        };

        expect(Selectors.getMyFirstChannelForTeams(state)).toEqual({
            team1: state.entities.channels.channels.channelA,
            team2: state.entities.channels.channels.channelB,
        });
    });

    test('should only return channels that the current user is a member of', () => {
        const state = {
            entities: {
                channels: {
                    channels: {
                        channelA: {id: 'channelA', name: 'channelA', team_id: 'team1'},
                        channelB: {id: 'channelB', name: 'channelB', team_id: 'team1'},
                    },
                    myMembers: {
                        channelB: {},
                    },
                },
                teams: {
                    myMembers: {
                        team1: {},
                    },
                    teams: {
                        team1: {id: 'team1', delete_at: 0},
                    },
                },
                users: {
                    currentUserId: 'user',
                    profiles: {
                        user: {},
                    },
                },
            },
        };

        expect(Selectors.getMyFirstChannelForTeams(state)).toEqual({
            team1: state.entities.channels.channels.channelB,
        });
    });

    test('should only return teams that the current user is a member of', () => {
        const state = {
            entities: {
                channels: {
                    channels: {
                        channelA: {id: 'channelA', name: 'channelA', team_id: 'team1'},
                        channelB: {id: 'channelB', name: 'channelB', team_id: 'team2'},
                    },
                    myMembers: {
                        channelA: {},
                        channelB: {},
                    },
                },
                teams: {
                    myMembers: {
                        team1: {},
                    },
                    teams: {
                        team1: {id: 'team1', delete_at: 0},
                        team2: {id: 'team2', delete_at: 0},
                    },
                },
                users: {
                    currentUserId: 'user',
                    profiles: {
                        user: {},
                    },
                },
            },
        };

        expect(Selectors.getMyFirstChannelForTeams(state)).toEqual({
            team1: state.entities.channels.channels.channelA,
        });
    });
});

test('Selectors.Channels.isManuallyUnread', () => {
    const state = {
        entities: {
            channels: {
                manuallyUnread: {
                    channel1: true,
                    channel2: false,
                },
            },
        },
    };

    assert.equal(Selectors.isManuallyUnread(state, 'channel1'), true);
    assert.equal(Selectors.isManuallyUnread(state, undefined), false);
    assert.equal(Selectors.isManuallyUnread(state, 'channel2'), false);
    assert.equal(Selectors.isManuallyUnread(state, 'channel3'), false);
});

test('Selectors.Channels.getChannelModerations', () => {
    const moderations = [{
        name: Permissions.CHANNEL_MODERATED_PERMISSIONS.CREATE_POST,
        roles: {
            members: true,
        },
    }];

    const state = {
        entities: {
            channels: {
                channelModerations: {
                    channel1: moderations,
                },
            },
        },
    };

    assert.equal(Selectors.getChannelModerations(state, 'channel1'), moderations);
    assert.equal(Selectors.getChannelModerations(state, undefined), undefined);
    assert.equal(Selectors.getChannelModerations(state, 'undefined'), undefined);
});

test('Selectors.Channels.getChannelMemberCountsByGroup', () => {
    const memberCounts = {
        'group-1': {
            group_id: 'group-1',
            channel_member_count: 1,
            channel_member_timezones_count: 1,
        },
        'group-2': {
            group_id: 'group-2',
            channel_member_count: 999,
            channel_member_timezones_count: 131,
        },
    };

    const state = {
        entities: {
            channels: {
                channelMemberCountsByGroup: {
                    channel1: memberCounts,
                },
            },
        },
    };

    assert.deepEqual(Selectors.getChannelMemberCountsByGroup(state, 'channel1'), memberCounts);
    assert.deepEqual(Selectors.getChannelMemberCountsByGroup(state, undefined), {});
    assert.deepEqual(Selectors.getChannelMemberCountsByGroup(state, 'undefined'), {});
});

describe('isFavoriteChannel', () => {
    test('should use preferences if old sidebar is enabled', () => {
        const channelId = 'channelId';
        const preferenceKey = `${Preferences.CATEGORY_FAVORITE_CHANNEL}--${channelId}`;

        let state = {
            entities: {
                general: {
                    config: {
                        EnableLegacySidebar: 'true',
                    },
                },
                preferences: {
                    myPreferences: {},
                },
            },
        };

        expect(Selectors.isFavoriteChannel(state, channelId)).toBe(false);

        state = mergeObjects(state, {
            entities: {
                preferences: {
                    myPreferences: {
                        [preferenceKey]: {
                            value: 'false',
                        },
                    },
                },
            },
        });

        expect(Selectors.isFavoriteChannel(state, channelId)).toBe(false);

        state = mergeObjects(state, {
            entities: {
                preferences: {
                    myPreferences: {
                        [preferenceKey]: {
                            value: 'true',
                        },
                    },
                },
            },
        });

        expect(Selectors.isFavoriteChannel(state, channelId)).toBe(true);
    });

    test('should use channel categories if new sidebar is enabled', () => {
        const currentTeamId = 'currentTeamId';
        const channel = {id: 'channel'};

        const favoritesCategory = {
            id: 'favoritesCategory',
            team_id: currentTeamId,
            type: CategoryTypes.FAVORITES,
            channel_ids: [],
        };

        let state = {
            entities: {
                channels: {
                    channels: {
                        channel,
                    },
                },
                channelCategories: {
                    byId: {
                        favoritesCategory,
                    },
                    orderByTeam: {
                        [currentTeamId]: [favoritesCategory.id],
                    },
                },
                preferences: {
                    myPreferences: {},
                },
                teams: {
                    currentTeamId,
                },
                general: {
                    config: {},
                },
            },
        };

        expect(Selectors.isFavoriteChannel(state, channel.id)).toBe(false);

        state = mergeObjects(state, {
            entities: {
                channelCategories: {
                    byId: {
                        [favoritesCategory.id]: {
                            ...favoritesCategory,
                            channel_ids: [channel.id],
                        },
                    },
                },
            },
        });

        expect(Selectors.isFavoriteChannel(state, channel.id)).toBe(true);
    });
});
