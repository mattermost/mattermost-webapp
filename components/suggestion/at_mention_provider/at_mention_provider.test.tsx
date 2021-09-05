// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Constants} from 'utils/constants';
import AtMentionProvider, {Item} from 'components/suggestion/at_mention_provider/at_mention_provider';
import AtMentionSuggestion from 'components/suggestion/at_mention_provider/at_mention_suggestion';
import {Group} from 'mattermost-redux/types/groups';

jest.useFakeTimers();

describe('components/suggestion/at_mention_provider/AtMentionProvider', () => {
    const userid10 = {id: 'userid10', username: 'nicknamer', first_name: '', last_name: '', nickname: 'Z'} as Item;
    const userid3 = {id: 'userid3', username: 'other', first_name: 'X', last_name: 'Y', nickname: 'Z'} as Item;
    const userid1 = {id: 'userid1', username: 'user', first_name: 'a', last_name: 'b', nickname: 'c', isCurrentUser: true} as Item;
    const userid2 = {id: 'userid2', username: 'user2', first_name: 'd', last_name: 'e', nickname: 'f'} as Item;
    const userid4 = {id: 'userid4', username: 'user4', first_name: 'X', last_name: 'Y', nickname: 'Z'} as Item;
    const userid5 = {id: 'userid5', username: 'user5', first_name: 'out', last_name: 'out', nickname: 'out'} as Item;
    const userid6 = {id: 'userid6', username: 'user6.six-split', first_name: 'out Junior', last_name: 'out', nickname: 'out'} as Item;
    const userid7 = {id: 'userid7', username: 'xuser7', first_name: '', last_name: '', nickname: 'x'} as Item;
    const userid8 = {id: 'userid8', username: 'xuser8', first_name: 'Robert', last_name: 'Ward', nickname: 'nickname'} as Item;

    const groupid1 = {id: 'groupid1', name: 'board', display_name: 'board'} as Group;
    const groupid2 = {id: 'groupid2', name: 'developers', display_name: 'developers'} as Group;
    const groupid3 = {id: 'groupid3', name: 'software-engineers', display_name: 'software engineers'} as Group;

    const baseParams = {
        currentUserId: 'userid1',
        currentTeamId: 'teamid1',
        currentChannelId: 'channelid1',
        profilesInChannel: [userid10, userid3, userid1, userid2],
        autocompleteUsersInChannel: jest.fn().mockResolvedValue(false),
        autocompleteGroups: [groupid1, groupid2, groupid3],
        useChannelMentions: true,
        searchAssociatedGroupsForReference: jest.fn().mockResolvedValue(false),
        priorityProfiles: [],
    };

    it('should ignore pretexts that are not at-mentions', () => {
        const provider = new AtMentionProvider(baseParams);
        const resultCallback = jest.fn();
        expect(provider.handlePretextChanged('', resultCallback)).toEqual(false);
        expect(provider.handlePretextChanged('user', resultCallback)).toEqual(false);
        expect(provider.handlePretextChanged('this is a sentence', resultCallback)).toEqual(false);
        expect(baseParams.autocompleteUsersInChannel).not.toHaveBeenCalled();
        expect(baseParams.searchAssociatedGroupsForReference).not.toHaveBeenCalled();
    });

    it('should suggest for "@"', async () => {
        const pretext = '@';
        const matchedPretext = '@';
        const itemsCall3 = [
            {...userid10, type: Constants.MENTION_MEMBERS},
            {...userid3, type: Constants.MENTION_MEMBERS},
            {...userid1, type: Constants.MENTION_MEMBERS},
            {...userid2, type: Constants.MENTION_MEMBERS},
            {...userid4, type: Constants.MENTION_MEMBERS},
            {...groupid1, type: Constants.MENTION_GROUPS},
            {...groupid2, type: Constants.MENTION_GROUPS},
            {...groupid3, type: Constants.MENTION_GROUPS},
            {type: Constants.MENTION_SPECIAL, username: 'here'},
            {type: Constants.MENTION_SPECIAL, username: 'channel'},
            {type: Constants.MENTION_SPECIAL, username: 'all'},
            {...userid5, type: Constants.MENTION_NONMEMBERS},
            {...userid6, type: Constants.MENTION_NONMEMBERS},
        ] as Item[];
        const params = {
            ...baseParams,
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({data: {
                    users: [userid4],
                    out_of_channel: [userid5, userid6],
                }});
            })),
            searchAssociatedGroupsForReference: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({
                    data: [groupid1, groupid2, groupid3],
                });
                expect(provider.updateMatches(resultCallback, itemsCall3)).toEqual(true);
            })),
        };

        const provider = new AtMentionProvider(params);
        const resultCallback = jest.fn();
        expect(provider.handlePretextChanged(pretext, resultCallback)).toEqual(true);

        expect(resultCallback).toHaveBeenNthCalledWith(1, {
            matchedPretext,
            terms: [
                '@nicknamer',
                '@other',
                '@user',
                '@user2',
                '@board',
                '@developers',
                '@software-engineers',
                '@here',
                '@channel',
                '@all',
            ],
            items: [
                {...userid10, type: Constants.MENTION_MEMBERS},
                {...userid3, type: Constants.MENTION_MEMBERS},
                {...userid1, type: Constants.MENTION_MEMBERS},
                {...userid2, type: Constants.MENTION_MEMBERS},
                {...groupid1, type: Constants.MENTION_GROUPS},
                {...groupid2, type: Constants.MENTION_GROUPS},
                {...groupid3, type: Constants.MENTION_GROUPS},
                {type: Constants.MENTION_SPECIAL, username: 'here'},
                {type: Constants.MENTION_SPECIAL, username: 'channel'},
                {type: Constants.MENTION_SPECIAL, username: 'all'},
            ],
            component: AtMentionSuggestion,
        });

        jest.runOnlyPendingTimers();

        expect(resultCallback).toHaveBeenNthCalledWith(2, {
            matchedPretext,
            terms: [
                '@nicknamer',
                '@other',
                '@user',
                '@user2',
                '@board',
                '@developers',
                '@software-engineers',
                '@here',
                '@channel',
                '@all',
                '',
            ],
            items: [
                {...userid10, type: Constants.MENTION_MEMBERS},
                {...userid3, type: Constants.MENTION_MEMBERS},
                {...userid1, type: Constants.MENTION_MEMBERS},
                {...userid2, type: Constants.MENTION_MEMBERS},
                {...groupid1, type: Constants.MENTION_GROUPS},
                {...groupid2, type: Constants.MENTION_GROUPS},
                {...groupid3, type: Constants.MENTION_GROUPS},
                {type: Constants.MENTION_SPECIAL, username: 'here'},
                {type: Constants.MENTION_SPECIAL, username: 'channel'},
                {type: Constants.MENTION_SPECIAL, username: 'all'},
                {type: Constants.MENTION_MORE_MEMBERS, loading: true},
            ],
            component: AtMentionSuggestion,
        });

        await Promise.resolve().then(() => {
            expect(resultCallback).toHaveBeenNthCalledWith(3, {
                matchedPretext,
                terms: [
                    '@nicknamer',
                    '@other',
                    '@user',
                    '@user2',
                    '@user4',
                    '@board',
                    '@developers',
                    '@software-engineers',
                    '@here',
                    '@channel',
                    '@all',
                    '@user5',
                    '@user6.six-split',
                ],
                items: itemsCall3,
                component: AtMentionSuggestion,
            });
        });
    });

    it('should have priorityProfiles at the top', async () => {
        const userid11 = {id: 'userid11', username: 'user11', first_name: 'firstname11', last_name: 'lastname11', nickname: 'nickname11'} as Item;
        const userid12 = {id: 'userid12', username: 'user12', first_name: 'firstname12', last_name: 'lastname12', nickname: 'nickname12'} as Item;

        const pretext = '@';
        const matchedPretext = '@';
        const itemsCall3 = [
            {...userid11, type: Constants.MENTION_MEMBERS},
            {...userid12, type: Constants.MENTION_MEMBERS},
            {...userid10, type: Constants.MENTION_MEMBERS},
            {...userid3, type: Constants.MENTION_MEMBERS},
            {...userid1, type: Constants.MENTION_MEMBERS},
            {...userid2, type: Constants.MENTION_MEMBERS},
            {...userid4, type: Constants.MENTION_MEMBERS},
            {...groupid1, type: Constants.MENTION_GROUPS},
            {...groupid2, type: Constants.MENTION_GROUPS},
            {...groupid3, type: Constants.MENTION_GROUPS},
            {type: Constants.MENTION_SPECIAL, username: 'here'},
            {type: Constants.MENTION_SPECIAL, username: 'channel'},
            {type: Constants.MENTION_SPECIAL, username: 'all'},
            {...userid5, type: Constants.MENTION_NONMEMBERS},
            {...userid6, type: Constants.MENTION_NONMEMBERS},
        ] as Item[];

        const params = {
            ...baseParams,
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({data: {
                    users: [userid4],
                    out_of_channel: [userid5, userid6],
                }});
            })),
            searchAssociatedGroupsForReference: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({
                    data: [groupid1, groupid2, groupid3],
                });
                expect(provider.updateMatches(resultCallback, itemsCall3)).toEqual(true);
            })),
            priorityProfiles: [
                userid11,
                userid12,
            ],
        };

        const provider = new AtMentionProvider(params);
        const resultCallback = jest.fn();
        expect(provider.handlePretextChanged(pretext, resultCallback)).toEqual(true);

        expect(resultCallback).toHaveBeenNthCalledWith(1, {
            matchedPretext,
            terms: [
                '@user11',
                '@user12',
                '@nicknamer',
                '@other',
                '@user',
                '@user2',
                '@board',
                '@developers',
                '@software-engineers',
                '@here',
                '@channel',
                '@all',
            ],
            items: [
                {...userid11, type: Constants.MENTION_MEMBERS},
                {...userid12, type: Constants.MENTION_MEMBERS},
                {...userid10, type: Constants.MENTION_MEMBERS},
                {...userid3, type: Constants.MENTION_MEMBERS},
                {...userid1, type: Constants.MENTION_MEMBERS},
                {...userid2, type: Constants.MENTION_MEMBERS},
                {...groupid1, type: Constants.MENTION_GROUPS},
                {...groupid2, type: Constants.MENTION_GROUPS},
                {...groupid3, type: Constants.MENTION_GROUPS},
                {type: Constants.MENTION_SPECIAL, username: 'here'},
                {type: Constants.MENTION_SPECIAL, username: 'channel'},
                {type: Constants.MENTION_SPECIAL, username: 'all'},
            ],
            component: AtMentionSuggestion,
        });

        jest.runOnlyPendingTimers();

        expect(resultCallback).toHaveBeenNthCalledWith(2, {
            matchedPretext,
            terms: [
                '@user11',
                '@user12',
                '@nicknamer',
                '@other',
                '@user',
                '@user2',
                '@board',
                '@developers',
                '@software-engineers',
                '@here',
                '@channel',
                '@all',
                '',
            ],
            items: [
                {...userid11, type: Constants.MENTION_MEMBERS},
                {...userid12, type: Constants.MENTION_MEMBERS},
                {...userid10, type: Constants.MENTION_MEMBERS},
                {...userid3, type: Constants.MENTION_MEMBERS},
                {...userid1, type: Constants.MENTION_MEMBERS},

                {...userid2, type: Constants.MENTION_MEMBERS},
                {...groupid1, type: Constants.MENTION_GROUPS},
                {...groupid2, type: Constants.MENTION_GROUPS},
                {...groupid3, type: Constants.MENTION_GROUPS},
                {type: Constants.MENTION_SPECIAL, username: 'here'},
                {type: Constants.MENTION_SPECIAL, username: 'channel'},
                {type: Constants.MENTION_SPECIAL, username: 'all'},
                {type: Constants.MENTION_MORE_MEMBERS, loading: true},
            ],
            component: AtMentionSuggestion,
        });

        await Promise.resolve().then(() => {
            expect(resultCallback).toHaveBeenNthCalledWith(3, {
                matchedPretext,
                terms: [
                    '@user11',
                    '@user12',
                    '@nicknamer',
                    '@other',
                    '@user',
                    '@user2',
                    '@user4',
                    '@board',
                    '@developers',
                    '@software-engineers',
                    '@here',
                    '@channel',
                    '@all',
                    '@user5',
                    '@user6.six-split',
                ],
                items: itemsCall3,
                component: AtMentionSuggestion,
            });
        });
    });

    it('should remove duplicates from results', async () => {
        const userid11 = {id: 'userid11', username: 'user11', first_name: 'firstname11', last_name: 'lastname11', nickname: 'nickname11'} as Item;
        const userid12 = {id: 'userid12', username: 'user12', first_name: 'firstname12', last_name: 'lastname12', nickname: 'nickname12'} as Item;

        const pretext = '@';
        const matchedPretext = '@';
        const itemsCall3 = [
            {...userid11, type: Constants.MENTION_MEMBERS},
            {...userid12, type: Constants.MENTION_MEMBERS},
            {...userid10, type: Constants.MENTION_MEMBERS},
            {...userid3, type: Constants.MENTION_MEMBERS},
            {...userid1, type: Constants.MENTION_MEMBERS},

            {...userid2, type: Constants.MENTION_MEMBERS},
            {...userid4, type: Constants.MENTION_MEMBERS},
            {...groupid1, type: Constants.MENTION_GROUPS},
            {...groupid2, type: Constants.MENTION_GROUPS},
            {...groupid3, type: Constants.MENTION_GROUPS},
            {type: Constants.MENTION_SPECIAL, username: 'here'},
            {type: Constants.MENTION_SPECIAL, username: 'channel'},
            {type: Constants.MENTION_SPECIAL, username: 'all'},
            {...userid5, type: Constants.MENTION_NONMEMBERS},
            {...userid6, type: Constants.MENTION_NONMEMBERS},
        ] as Item [];

        const params = {
            ...baseParams,
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({data: {
                    users: [userid4, userid11],
                    out_of_channel: [userid5, userid6],
                }});
            })),
            searchAssociatedGroupsForReference: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({
                    data: [groupid1, groupid2, groupid3],
                });
                expect(provider.updateMatches(resultCallback, itemsCall3)).toEqual(true);
            })),
            priorityProfiles: [
                userid11,
                userid12,
            ],
            profilesInChannel: [userid10, userid3, userid1, userid2, userid12],
        };

        const provider = new AtMentionProvider(params);
        const resultCallback = jest.fn();
        expect(provider.handlePretextChanged(pretext, resultCallback)).toEqual(true);

        expect(resultCallback).toHaveBeenNthCalledWith(1, {
            matchedPretext,
            terms: [
                '@user11',
                '@user12',
                '@nicknamer',
                '@other',
                '@user',
                '@user2',
                '@board',
                '@developers',
                '@software-engineers',
                '@here',
                '@channel',
                '@all',
            ],
            items: [
                {...userid11, type: Constants.MENTION_MEMBERS},
                {...userid12, type: Constants.MENTION_MEMBERS},
                {...userid10, type: Constants.MENTION_MEMBERS},
                {...userid3, type: Constants.MENTION_MEMBERS},
                {...userid1, type: Constants.MENTION_MEMBERS},
                {...userid2, type: Constants.MENTION_MEMBERS},
                {...groupid1, type: Constants.MENTION_GROUPS},
                {...groupid2, type: Constants.MENTION_GROUPS},
                {...groupid3, type: Constants.MENTION_GROUPS},
                {type: Constants.MENTION_SPECIAL, username: 'here'},
                {type: Constants.MENTION_SPECIAL, username: 'channel'},
                {type: Constants.MENTION_SPECIAL, username: 'all'},
            ],
            component: AtMentionSuggestion,
        });

        jest.runOnlyPendingTimers();

        expect(resultCallback).toHaveBeenNthCalledWith(2, {
            matchedPretext,
            terms: [
                '@user11',
                '@user12',
                '@nicknamer',
                '@other',
                '@user',
                '@user2',
                '@board',
                '@developers',
                '@software-engineers',
                '@here',
                '@channel',
                '@all',
                '',
            ],
            items: [
                {...userid11, type: Constants.MENTION_MEMBERS},
                {...userid12, type: Constants.MENTION_MEMBERS},
                {...userid10, type: Constants.MENTION_MEMBERS},
                {...userid3, type: Constants.MENTION_MEMBERS},
                {...userid1, type: Constants.MENTION_MEMBERS},
                {...userid2, type: Constants.MENTION_MEMBERS},
                {...groupid1, type: Constants.MENTION_GROUPS},
                {...groupid2, type: Constants.MENTION_GROUPS},
                {...groupid3, type: Constants.MENTION_GROUPS},
                {type: Constants.MENTION_SPECIAL, username: 'here'},
                {type: Constants.MENTION_SPECIAL, username: 'channel'},
                {type: Constants.MENTION_SPECIAL, username: 'all'},
                {type: Constants.MENTION_MORE_MEMBERS, loading: true},
            ],
            component: AtMentionSuggestion,
        });

        await Promise.resolve().then(() => {
            expect(resultCallback).toHaveBeenNthCalledWith(3, {
                matchedPretext,
                terms: [
                    '@user11',
                    '@user12',
                    '@nicknamer',
                    '@other',
                    '@user',
                    '@user2',
                    '@user4',
                    '@board',
                    '@developers',
                    '@software-engineers',
                    '@here',
                    '@channel',
                    '@all',
                    '@user5',
                    '@user6.six-split',
                ],
                items: itemsCall3,
                component: AtMentionSuggestion,
            });
        });
    });

    it('should sort results based on last_viewed_at', async () => {
        const userid11 = {id: 'userid11', username: 'user11', first_name: 'firstname11', last_name: 'lastname11', nickname: 'nickname11'} as Item;
        const userid12 = {id: 'userid12', username: 'user12', first_name: 'firstname12', last_name: 'lastname12', nickname: 'nickname12'} as Item;

        const pretext = '@';
        const matchedPretext = '@';
        const itemsCall3 = [
            {...userid11, type: Constants.MENTION_MEMBERS},
            {...userid12, type: Constants.MENTION_MEMBERS},
            {...userid10, type: Constants.MENTION_MEMBERS},
            {...userid3, type: Constants.MENTION_MEMBERS},
            {...userid1, type: Constants.MENTION_MEMBERS},

            {...userid2, type: Constants.MENTION_MEMBERS},
            {...userid4, type: Constants.MENTION_MEMBERS},
            {...groupid1, type: Constants.MENTION_GROUPS},
            {...groupid2, type: Constants.MENTION_GROUPS},
            {...groupid3, type: Constants.MENTION_GROUPS},
            {type: Constants.MENTION_SPECIAL, username: 'here'},
            {type: Constants.MENTION_SPECIAL, username: 'channel'},
            {type: Constants.MENTION_SPECIAL, username: 'all'},
            {...userid5, type: Constants.MENTION_NONMEMBERS},
            {...userid6, type: Constants.MENTION_NONMEMBERS},
        ] as Item [];

        const params = {
            ...baseParams,
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({data: {
                    users: [userid4, userid11],
                    out_of_channel: [userid5, userid6],
                }});
            })),
            searchAssociatedGroupsForReference: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({
                    data: [groupid1, groupid2, groupid3],
                });
                expect(provider.updateMatches(resultCallback, itemsCall3)).toEqual(true);
            })),
            priorityProfiles: [
                userid11,
                userid12,
            ],
            profilesInChannel: [userid10, {...userid3, last_viewed_at: 10}, {...userid1, last_viewed_at: 11}, userid2, userid12],
        };

        const provider = new AtMentionProvider(params);
        const resultCallback = jest.fn();
        expect(provider.handlePretextChanged(pretext, resultCallback)).toEqual(true);

        expect(resultCallback).toHaveBeenNthCalledWith(1, {
            matchedPretext,
            terms: [
                '@user11',
                '@user12',
                '@user',
                '@other',
                '@nicknamer',
                '@user2',
                '@board',
                '@developers',
                '@software-engineers',
                '@here',
                '@channel',
                '@all',
            ],
            items: [
                {...userid11, type: Constants.MENTION_MEMBERS},
                {...userid12, type: Constants.MENTION_MEMBERS},
                {...userid1, type: Constants.MENTION_MEMBERS, last_viewed_at: 11},
                {...userid3, type: Constants.MENTION_MEMBERS, last_viewed_at: 10},
                {...userid10, type: Constants.MENTION_MEMBERS},
                {...userid2, type: Constants.MENTION_MEMBERS},
                {...groupid1, type: Constants.MENTION_GROUPS},
                {...groupid2, type: Constants.MENTION_GROUPS},
                {...groupid3, type: Constants.MENTION_GROUPS},
                {type: Constants.MENTION_SPECIAL, username: 'here'},
                {type: Constants.MENTION_SPECIAL, username: 'channel'},
                {type: Constants.MENTION_SPECIAL, username: 'all'},
            ],
            component: AtMentionSuggestion,
        });

        jest.runOnlyPendingTimers();

        expect(resultCallback).toHaveBeenNthCalledWith(2, {
            matchedPretext,
            terms: [
                '@user11',
                '@user12',
                '@user',
                '@other',
                '@nicknamer',
                '@user2',
                '@board',
                '@developers',
                '@software-engineers',
                '@here',
                '@channel',
                '@all',
                '',
            ],
            items: [
                {...userid11, type: Constants.MENTION_MEMBERS},
                {...userid12, type: Constants.MENTION_MEMBERS},
                {...userid1, type: Constants.MENTION_MEMBERS, last_viewed_at: 11},
                {...userid3, type: Constants.MENTION_MEMBERS, last_viewed_at: 10},
                {...userid10, type: Constants.MENTION_MEMBERS},
                {...userid2, type: Constants.MENTION_MEMBERS},
                {...groupid1, type: Constants.MENTION_GROUPS},
                {...groupid2, type: Constants.MENTION_GROUPS},
                {...groupid3, type: Constants.MENTION_GROUPS},
                {type: Constants.MENTION_SPECIAL, username: 'here'},
                {type: Constants.MENTION_SPECIAL, username: 'channel'},
                {type: Constants.MENTION_SPECIAL, username: 'all'},
                {type: Constants.MENTION_MORE_MEMBERS, loading: true},
            ],
            component: AtMentionSuggestion,
        });
    });

    it('should suggest for "@", skipping the loading indicator if results load quickly', async () => {
        const pretext = '@';
        const matchedPretext = '@';
        const itemsCall2 = [
            {...userid10, type: Constants.MENTION_MEMBERS},
            {...userid3, type: Constants.MENTION_MEMBERS},
            {...userid1, type: Constants.MENTION_MEMBERS},

            {...userid2, type: Constants.MENTION_MEMBERS},
            {...userid4, type: Constants.MENTION_MEMBERS},
            {...groupid1, type: Constants.MENTION_GROUPS},
            {...groupid2, type: Constants.MENTION_GROUPS},
            {...groupid3, type: Constants.MENTION_GROUPS},
            {type: Constants.MENTION_SPECIAL, username: 'here'},
            {type: Constants.MENTION_SPECIAL, username: 'channel'},
            {type: Constants.MENTION_SPECIAL, username: 'all'},
            {...userid5, type: Constants.MENTION_NONMEMBERS},
            {...userid6, type: Constants.MENTION_NONMEMBERS},
        ] as Item [];
        const params = {
            ...baseParams,
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({data: {
                    users: [userid4],
                    out_of_channel: [userid5, userid6],
                }});
            })),
            searchAssociatedGroupsForReference: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({
                    data: [groupid1, groupid2, groupid3],
                });
                expect(provider.updateMatches(resultCallback, itemsCall2)).toEqual(true);
            })),
        };

        const provider = new AtMentionProvider(params);
        const resultCallback = jest.fn();
        expect(provider.handlePretextChanged(pretext, resultCallback)).toEqual(true);

        expect(resultCallback).toHaveBeenNthCalledWith(1, {
            matchedPretext,
            terms: [
                '@nicknamer',
                '@other',
                '@user',
                '@user2',
                '@board',
                '@developers',
                '@software-engineers',
                '@here',
                '@channel',
                '@all',
            ],
            items: [
                {...userid10, type: Constants.MENTION_MEMBERS},
                {...userid3, type: Constants.MENTION_MEMBERS},
                {...userid1, type: Constants.MENTION_MEMBERS},

                {...userid2, type: Constants.MENTION_MEMBERS},
                {...groupid1, type: Constants.MENTION_GROUPS},
                {...groupid2, type: Constants.MENTION_GROUPS},
                {...groupid3, type: Constants.MENTION_GROUPS},
                {type: Constants.MENTION_SPECIAL, username: 'here'},
                {type: Constants.MENTION_SPECIAL, username: 'channel'},
                {type: Constants.MENTION_SPECIAL, username: 'all'},
            ],
            component: AtMentionSuggestion,
        });

        await Promise.resolve().then(() => {
            jest.runOnlyPendingTimers();

            expect(resultCallback).toHaveBeenNthCalledWith(2, {
                matchedPretext,
                terms: [
                    '@nicknamer',
                    '@other',
                    '@user',
                    '@user2',
                    '@user4',
                    '@board',
                    '@developers',
                    '@software-engineers',
                    '@here',
                    '@channel',
                    '@all',
                    '@user5',
                    '@user6.six-split',
                ],
                items: itemsCall2,
                component: AtMentionSuggestion,
            });
        });
    });

    it('should suggest for "@h"', async () => {
        const pretext = '@h';
        const matchedPretext = '@h';
        const itemsCall3 = [
            {type: Constants.MENTION_SPECIAL, username: 'here'},
        ] as Item[];
        const params = {
            ...baseParams,
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({data: {
                    users: [],
                    out_of_channel: [],
                }});
            })),
            searchAssociatedGroupsForReference: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({
                    data: [],
                });
                expect(provider.updateMatches(resultCallback, itemsCall3)).toEqual(true);
            })),
        };

        const provider = new AtMentionProvider(params);
        const resultCallback = jest.fn();
        expect(provider.handlePretextChanged(pretext, resultCallback)).toEqual(true);

        expect(resultCallback).toHaveBeenNthCalledWith(1, {
            matchedPretext,
            terms: [
                '@here',
            ],
            items: [
                {type: Constants.MENTION_SPECIAL, username: 'here'},
            ],
            component: AtMentionSuggestion,
        });

        jest.runOnlyPendingTimers();

        expect(resultCallback).toHaveBeenNthCalledWith(2, {
            matchedPretext,
            terms: [
                '@here',
                '',
            ],
            items: [
                {type: Constants.MENTION_SPECIAL, username: 'here'},
                {type: Constants.MENTION_MORE_MEMBERS, loading: true},
            ],
            component: AtMentionSuggestion,
        });

        await Promise.resolve().then(() => {
            expect(resultCallback).toHaveBeenNthCalledWith(3, {
                matchedPretext,
                terms: [
                    '@here',
                ],
                items: itemsCall3,
                component: AtMentionSuggestion,
            });
        });
    });

    it('should suggest for username match "@user"', async () => {
        const pretext = '@user';
        const matchedPretext = '@user';
        const itemsCall3 = [
            {...userid1, type: Constants.MENTION_MEMBERS},

            {...userid2, type: Constants.MENTION_MEMBERS},
            {...userid4, type: Constants.MENTION_MEMBERS},
            {...userid5, type: Constants.MENTION_NONMEMBERS},
            {...userid6, type: Constants.MENTION_NONMEMBERS},
        ];
        const params = {
            ...baseParams,
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({data: {
                    users: [userid4],
                    out_of_channel: [userid5, userid6],
                }});
            })),
            searchAssociatedGroupsForReference: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({
                    data: [],
                });
                expect(provider.updateMatches(resultCallback, itemsCall3)).toEqual(true);
            })),
        };

        const provider = new AtMentionProvider(params);
        const resultCallback = jest.fn();
        expect(provider.handlePretextChanged(pretext, resultCallback)).toEqual(true);

        expect(resultCallback).toHaveBeenNthCalledWith(1, {
            matchedPretext,
            terms: [
                '@user',
                '@user2',
            ],
            items: [
                {...userid1, type: Constants.MENTION_MEMBERS},

                {...userid2, type: Constants.MENTION_MEMBERS},
            ],
            component: AtMentionSuggestion,
        });

        jest.runOnlyPendingTimers();
        expect(resultCallback).toHaveBeenNthCalledWith(2, {
            matchedPretext,
            terms: [
                '@user',
                '@user2',
                '',
            ],
            items: [
                {...userid1, type: Constants.MENTION_MEMBERS},

                {...userid2, type: Constants.MENTION_MEMBERS},
                {type: Constants.MENTION_MORE_MEMBERS, loading: true},
            ],
            component: AtMentionSuggestion,
        });

        await Promise.resolve().then(() => {
            expect(resultCallback).toHaveBeenNthCalledWith(3, {
                matchedPretext,
                terms: [
                    '@user',
                    '@user2',
                    '@user4',
                    '@user5',
                    '@user6.six-split',
                ],
                items: itemsCall3,
                component: AtMentionSuggestion,
            });
        });
    });

    it('should suggest for username match "@six"', async () => {
        const pretext = '@six';
        const matchedPretext = '@six';
        const itemsCall3 = [
            {...userid6, type: Constants.MENTION_NONMEMBERS},
        ];
        const params = {
            ...baseParams,
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({data: {
                    users: [userid4],
                    out_of_channel: [userid5, userid6],
                }});
            })),
            searchAssociatedGroupsForReference: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({
                    data: [],
                });
                expect(provider.updateMatches(resultCallback, itemsCall3)).toEqual(true);
            })),
        };

        const provider = new AtMentionProvider(params);
        const resultCallback = jest.fn();
        expect(provider.handlePretextChanged(pretext, resultCallback)).toEqual(true);

        expect(resultCallback).toHaveBeenNthCalledWith(1, {
            matchedPretext,
            terms: [],
            items: [],
            component: AtMentionSuggestion,
        });

        jest.runOnlyPendingTimers();

        expect(resultCallback).toHaveBeenNthCalledWith(2, {
            matchedPretext,
            terms: [
                '',
            ],
            items: [
                {type: Constants.MENTION_MORE_MEMBERS, loading: true},
            ],
            component: AtMentionSuggestion,
        });

        await Promise.resolve().then(() => {
            expect(resultCallback).toHaveBeenNthCalledWith(3, {
                matchedPretext,
                terms: [
                    '@user6.six-split',
                ],
                items: itemsCall3,
                component: AtMentionSuggestion,
            });
        });
    });

    it('should suggest for username match "@split"', async () => {
        const pretext = '@split';
        const matchedPretext = '@split';
        const itemsCall3 = [
            {...userid6, type: Constants.MENTION_NONMEMBERS},
        ];
        const params = {
            ...baseParams,
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({data: {
                    users: [userid4],
                    out_of_channel: [userid5, userid6],
                }});
            })),
            searchAssociatedGroupsForReference: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({
                    data: [],
                });
                expect(provider.updateMatches(resultCallback, itemsCall3)).toEqual(true);
            })),
        };

        const provider = new AtMentionProvider(params);
        const resultCallback = jest.fn();
        expect(provider.handlePretextChanged(pretext, resultCallback)).toEqual(true);

        expect(resultCallback).toHaveBeenNthCalledWith(1, {
            matchedPretext,
            terms: [],
            items: [],
            component: AtMentionSuggestion,
        });

        jest.runOnlyPendingTimers();

        expect(resultCallback).toHaveBeenNthCalledWith(2, {
            matchedPretext,
            terms: [
                '',
            ],
            items: [
                {type: Constants.MENTION_MORE_MEMBERS, loading: true},
            ],
            component: AtMentionSuggestion,
        });

        await Promise.resolve().then(() => {
            expect(resultCallback).toHaveBeenNthCalledWith(3, {
                matchedPretext,
                terms: [
                    '@user6.six-split',
                ],
                items: itemsCall3,
                component: AtMentionSuggestion,
            });
        });
    });

    it('should suggest for username match "@-split"', async () => {
        const pretext = '@-split';
        const matchedPretext = '@-split';
        const itemsCall3 = [
            {...userid6, type: Constants.MENTION_NONMEMBERS},
        ];
        const params = {
            ...baseParams,
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({data: {
                    users: [],
                    out_of_channel: [userid6],
                }});
            })),
            searchAssociatedGroupsForReference: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({
                    data: [],
                });
                expect(provider.updateMatches(resultCallback, itemsCall3)).toEqual(true);
            })),
        };

        const provider = new AtMentionProvider(params);
        const resultCallback = jest.fn();
        expect(provider.handlePretextChanged(pretext, resultCallback)).toEqual(true);

        expect(resultCallback).toHaveBeenNthCalledWith(1, {
            matchedPretext,
            terms: [],
            items: [],
            component: AtMentionSuggestion,
        });

        jest.runOnlyPendingTimers();
        expect(resultCallback).toHaveBeenNthCalledWith(2, {
            matchedPretext,
            terms: [
                '',
            ],
            items: [
                {type: Constants.MENTION_MORE_MEMBERS, loading: true},
            ],
            component: AtMentionSuggestion,
        });

        await Promise.resolve().then(() => {
            expect(resultCallback).toHaveBeenNthCalledWith(3, {
                matchedPretext,
                terms: [
                    '@user6.six-split',
                ],
                items: itemsCall3,
                component: AtMentionSuggestion,
            });
        });
    });

    it('should suggest for username match "@junior"', async () => {
        const pretext = '@junior';
        const matchedPretext = '@junior';
        const itemsCall3 = [
            {...userid6, type: Constants.MENTION_NONMEMBERS},
        ];
        const params = {
            ...baseParams,
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({data: {
                    users: [],
                    out_of_channel: [userid6],
                }});
            })),
            searchAssociatedGroupsForReference: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({
                    data: [],
                });
                expect(provider.updateMatches(resultCallback, itemsCall3)).toEqual(true);
            })),
        };

        const provider = new AtMentionProvider(params);
        const resultCallback = jest.fn();
        expect(provider.handlePretextChanged(pretext, resultCallback)).toEqual(true);

        expect(resultCallback).toHaveBeenNthCalledWith(1, {
            matchedPretext,
            terms: [],
            items: [],
            component: AtMentionSuggestion,
        });

        jest.runOnlyPendingTimers();

        expect(resultCallback).toHaveBeenNthCalledWith(2, {
            matchedPretext,
            terms: [
                '',
            ],
            items: [
                {type: Constants.MENTION_MORE_MEMBERS, loading: true},
            ],
            component: AtMentionSuggestion,
        });

        await Promise.resolve().then(() => {
            expect(resultCallback).toHaveBeenNthCalledWith(3, {
                matchedPretext,
                terms: [
                    '@user6.six-split',
                ],
                items: itemsCall3,
                component: AtMentionSuggestion,
            });
        });
    });

    it('should suggest for first_name match "@X"', async () => {
        const pretext = '@X';
        const matchedPretext = '@x';
        const itemsCall3 = [
            {...userid3, type: Constants.MENTION_MEMBERS},
            {...userid4, type: Constants.MENTION_MEMBERS},
        ];
        const params = {
            ...baseParams,
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({data: {
                    users: [userid4],
                    out_of_channel: [],
                }});
            })),
            searchAssociatedGroupsForReference: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({
                    data: [],
                });
                expect(provider.updateMatches(resultCallback, itemsCall3)).toEqual(true);
            })),
        };

        const provider = new AtMentionProvider(params);
        const resultCallback = jest.fn();
        expect(provider.handlePretextChanged(pretext, resultCallback)).toEqual(true);

        expect(resultCallback).toHaveBeenNthCalledWith(1, {
            matchedPretext,
            terms: [
                '@other',
            ],
            items: [
                {...userid3, type: Constants.MENTION_MEMBERS},
            ],
            component: AtMentionSuggestion,
        });

        jest.runOnlyPendingTimers();

        expect(resultCallback).toHaveBeenNthCalledWith(2, {
            matchedPretext,
            terms: [
                '@other',
                '',
            ],
            items: [
                {...userid3, type: Constants.MENTION_MEMBERS},
                {type: Constants.MENTION_MORE_MEMBERS, loading: true},
            ],
            component: AtMentionSuggestion,
        });

        await Promise.resolve().then(() => {
            expect(resultCallback).toHaveBeenNthCalledWith(3, {
                matchedPretext,
                terms: [
                    '@other',
                    '@user4',
                ],
                items: itemsCall3,
                component: AtMentionSuggestion,
            });
        });
    });

    it('should suggest for last_name match "@Y"', async () => {
        const pretext = '@Y';
        const matchedPretext = '@y';
        const itemsCall3 = [
            {...userid3, type: Constants.MENTION_MEMBERS},
            {...userid4, type: Constants.MENTION_MEMBERS},
        ];
        const params = {
            ...baseParams,
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({data: {
                    users: [userid4],
                    out_of_channel: [],
                }});
            })),
            searchAssociatedGroupsForReference: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({
                    data: [],
                });
                expect(provider.updateMatches(resultCallback, itemsCall3)).toEqual(true);
            })),
        };

        const provider = new AtMentionProvider(params);
        const resultCallback = jest.fn();
        expect(provider.handlePretextChanged(pretext, resultCallback)).toEqual(true);

        expect(resultCallback).toHaveBeenNthCalledWith(1, {
            matchedPretext,
            terms: [
                '@other',
            ],
            items: [
                {...userid3, type: Constants.MENTION_MEMBERS},
            ],
            component: AtMentionSuggestion,
        });

        jest.runOnlyPendingTimers();

        expect(resultCallback).toHaveBeenNthCalledWith(2, {
            matchedPretext,
            terms: [
                '@other',
                '',
            ],
            items: [
                {...userid3, type: Constants.MENTION_MEMBERS},
                {type: Constants.MENTION_MORE_MEMBERS, loading: true},
            ],
            component: AtMentionSuggestion,
        });

        await Promise.resolve().then(() => {
            expect(resultCallback).toHaveBeenNthCalledWith(3, {
                matchedPretext,
                terms: [
                    '@other',
                    '@user4',
                ],
                items: itemsCall3,
                component: AtMentionSuggestion,
            });
        });
    });

    it('should suggest for nickname match "@Z"', async () => {
        const pretext = '@Z';
        const matchedPretext = '@z';
        const itemsCall3 = [
            {...userid10, type: Constants.MENTION_MEMBERS},
            {...userid3, type: Constants.MENTION_MEMBERS},
            {...userid4, type: Constants.MENTION_MEMBERS},
        ];
        const params = {
            ...baseParams,
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({data: {
                    users: [userid4],
                    out_of_channel: [],
                }});
            })),
            searchAssociatedGroupsForReference: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({
                    data: [],
                });
                expect(provider.updateMatches(resultCallback, itemsCall3)).toEqual(true);
            })),
        };

        const provider = new AtMentionProvider(params);
        const resultCallback = jest.fn();
        expect(provider.handlePretextChanged(pretext, resultCallback)).toEqual(true);

        expect(resultCallback).toHaveBeenNthCalledWith(1, {
            matchedPretext,
            terms: [
                '@nicknamer',
                '@other',
            ],
            items: [
                {...userid10, type: Constants.MENTION_MEMBERS},
                {...userid3, type: Constants.MENTION_MEMBERS},
            ],
            component: AtMentionSuggestion,
        });

        jest.runOnlyPendingTimers();

        expect(resultCallback).toHaveBeenNthCalledWith(2, {
            matchedPretext,
            terms: [
                '@nicknamer',
                '@other',
                '',
            ],
            items: [
                {...userid10, type: Constants.MENTION_MEMBERS},
                {...userid3, type: Constants.MENTION_MEMBERS},
                {type: Constants.MENTION_MORE_MEMBERS, loading: true},
            ],
            component: AtMentionSuggestion,
        });

        await Promise.resolve().then(() => {
            expect(resultCallback).toHaveBeenNthCalledWith(3, {
                matchedPretext,
                terms: [
                    '@nicknamer',
                    '@other',
                    '@user4',
                ],
                items: itemsCall3,
                component: AtMentionSuggestion,
            });
        });
    });

    it('should suggest ignore out_of_channel if found locally', async () => {
        const pretext = '@user';
        const matchedPretext = '@user';
        const itemsCall3 = [
            {...userid1, type: Constants.MENTION_MEMBERS},

            {...userid2, type: Constants.MENTION_MEMBERS},
            {...userid4, type: Constants.MENTION_MEMBERS},
            {...userid5, type: Constants.MENTION_NONMEMBERS},
            {...userid6, type: Constants.MENTION_NONMEMBERS},
        ];
        const params = {
            ...baseParams,
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({data: {
                    users: [userid4],
                    out_of_channel: [userid1, userid2, userid5, userid6],
                }});
            })),
            searchAssociatedGroupsForReference: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({
                    data: [],
                });
                expect(provider.updateMatches(resultCallback, itemsCall3)).toEqual(true);
            })),
        };

        const provider = new AtMentionProvider(params);
        const resultCallback = jest.fn();
        expect(provider.handlePretextChanged(pretext, resultCallback)).toEqual(true);

        expect(resultCallback).toHaveBeenNthCalledWith(1, {
            matchedPretext,
            terms: [
                '@user',
                '@user2',
            ],
            items: [
                {...userid1, type: Constants.MENTION_MEMBERS},

                {...userid2, type: Constants.MENTION_MEMBERS},
            ],
            component: AtMentionSuggestion,
        });

        jest.runOnlyPendingTimers();

        expect(resultCallback).toHaveBeenNthCalledWith(2, {
            matchedPretext,
            terms: [
                '@user',
                '@user2',
                '',
            ],
            items: [
                {...userid1, type: Constants.MENTION_MEMBERS},

                {...userid2, type: Constants.MENTION_MEMBERS},
                {type: Constants.MENTION_MORE_MEMBERS, loading: true},
            ],
            component: AtMentionSuggestion,
        });

        await Promise.resolve().then(() => {
            expect(resultCallback).toHaveBeenNthCalledWith(3, {
                matchedPretext,
                terms: [
                    '@user',
                    '@user2',
                    '@user4',
                    '@user5',
                    '@user6.six-split',
                ],
                items: itemsCall3,
                component: AtMentionSuggestion,
            });
        });
    });

    it('should prioritise username match over other matches for in channel users', async () => {
        const pretext = '@x';
        const matchedPretext = '@x';
        const itemsCall3 = [
            {...userid7, type: Constants.MENTION_MEMBERS},
            {...userid3, type: Constants.MENTION_MEMBERS},
            {...userid4, type: Constants.MENTION_MEMBERS},
        ];
        const params = {
            ...baseParams,
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({data: {
                    users: [userid4, userid7],
                    out_of_channel: [],
                }});
            })),
            searchAssociatedGroupsForReference: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({
                    data: [],
                });
                expect(provider.updateMatches(resultCallback, itemsCall3)).toEqual(true);
            })),
        };

        const provider = new AtMentionProvider(params);
        const resultCallback = jest.fn();
        expect(provider.handlePretextChanged(pretext, resultCallback)).toEqual(true);

        expect(resultCallback).toHaveBeenNthCalledWith(1, {
            matchedPretext,
            terms: [
                '@other',
            ],
            items: [
                {...userid3, type: Constants.MENTION_MEMBERS},
            ],
            component: AtMentionSuggestion,
        });

        jest.runOnlyPendingTimers();

        expect(resultCallback).toHaveBeenNthCalledWith(2, {
            matchedPretext,
            terms: [
                '@other',
                '',
            ],
            items: [
                {...userid3, type: Constants.MENTION_MEMBERS},
                {type: Constants.MENTION_MORE_MEMBERS, loading: true},
            ],
            component: AtMentionSuggestion,
        });

        await Promise.resolve().then(() => {
            expect(resultCallback).toHaveBeenNthCalledWith(3, {
                matchedPretext,
                terms: [
                    '@xuser7',
                    '@other',
                    '@user4',
                ],
                items: itemsCall3,
                component: AtMentionSuggestion,
            });
        });
    });

    it('should prioritise username match over other matches for out of channel users', async () => {
        const pretext = '@x';
        const matchedPretext = '@x';
        const itemsCall3 = [
            {...userid3, type: Constants.MENTION_MEMBERS},
            {...userid7, type: Constants.MENTION_NONMEMBERS},
            {...userid4, type: Constants.MENTION_NONMEMBERS},
        ];
        const params = {
            ...baseParams,
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({data: {
                    users: [],
                    out_of_channel: [userid4, userid7],
                }});
            })),
            searchAssociatedGroupsForReference: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({
                    data: [],
                });
                expect(provider.updateMatches(resultCallback, itemsCall3)).toEqual(true);
            })),
        };

        const provider = new AtMentionProvider(params);
        const resultCallback = jest.fn();
        expect(provider.handlePretextChanged(pretext, resultCallback)).toEqual(true);

        expect(resultCallback).toHaveBeenNthCalledWith(1, {
            matchedPretext,
            terms: [
                '@other',
            ],
            items: [
                {...userid3, type: Constants.MENTION_MEMBERS},
            ],
            component: AtMentionSuggestion,
        });

        jest.runOnlyPendingTimers();

        expect(resultCallback).toHaveBeenNthCalledWith(2, {
            matchedPretext,
            terms: [
                '@other',
                '',
            ],
            items: [
                {...userid3, type: Constants.MENTION_MEMBERS},
                {type: Constants.MENTION_MORE_MEMBERS, loading: true},
            ],
            component: AtMentionSuggestion,
        });

        await Promise.resolve().then(() => {
            expect(resultCallback).toHaveBeenNthCalledWith(3, {
                matchedPretext,
                terms: [
                    '@other',
                    '@xuser7',
                    '@user4',
                ],
                items: itemsCall3,
                component: AtMentionSuggestion,
            });
        });
    });

    it('should suggest for full name match "robert ward"', async () => {
        const pretext = '@robert ward';
        const matchedPretext = '@robert ward';
        const itemsCall3 = [
            {...userid8, type: Constants.MENTION_NONMEMBERS},
        ];
        const params = {
            ...baseParams,
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({data: {
                    users: [],
                    out_of_channel: [userid8],
                }});
            })),
            searchAssociatedGroupsForReference: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({
                    data: [],
                });
                expect(provider.updateMatches(resultCallback, itemsCall3)).toEqual(true);
            })),
        };

        const provider = new AtMentionProvider(params);
        const resultCallback = jest.fn();
        expect(provider.handlePretextChanged(pretext, resultCallback)).toEqual(true);

        expect(resultCallback).toHaveBeenNthCalledWith(1, {
            matchedPretext,
            terms: [],
            items: [],
            component: AtMentionSuggestion,
        });

        jest.runOnlyPendingTimers();
        expect(resultCallback).toHaveBeenNthCalledWith(2, {
            matchedPretext,
            terms: [
                '',
            ],
            items: [
                {type: Constants.MENTION_MORE_MEMBERS, loading: true},
            ],
            component: AtMentionSuggestion,
        });

        await Promise.resolve().then(() => {
            expect(resultCallback).toHaveBeenNthCalledWith(3, {
                matchedPretext,
                terms: [
                    '@xuser8',
                ],
                items: itemsCall3,
                component: AtMentionSuggestion,
            });
        });
    });

    it('should ignore channel mentions - @here, @channel and @all when useChannelMentions is false', () => {
        const pretext = '@';
        const matchedPretext = '@';
        const params = {
            ...baseParams,
            useChannelMentions: false,
            profilesInChannel: [],
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({data: {
                    users: [],
                    out_of_channel: [],
                }});
            })),
            searchAssociatedGroupsForReference: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({
                    data: [groupid1, groupid2, groupid3],
                });
            })),
        };

        const provider = new AtMentionProvider(params);
        const resultCallback = jest.fn();
        expect(provider.handlePretextChanged(pretext, resultCallback)).toEqual(true);

        expect(resultCallback).toHaveBeenNthCalledWith(1, {
            matchedPretext,
            terms: [
                '@board',
                '@developers',
                '@software-engineers',
            ],
            items: [
                {...groupid1, type: Constants.MENTION_GROUPS},
                {...groupid2, type: Constants.MENTION_GROUPS},
                {...groupid3, type: Constants.MENTION_GROUPS},
            ],
            component: AtMentionSuggestion,
        });
    });
    it('should suggest for full group display name match "software engineers"', async () => {
        const pretext = '@software engineers';
        const matchedPretext = '@software engineers';
        const itemsCall3 = [
            {...groupid3, type: Constants.MENTION_GROUPS},
        ] as Item[];
        const params = {
            ...baseParams,
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({data: {
                    users: [],
                    out_of_channel: [],
                }});
            })),
            searchAssociatedGroupsForReference: jest.fn().mockImplementation(() => () => new Promise((resolve) => {
                resolve({
                    data: [groupid3],
                });
                expect(provider.updateMatches(resultCallback, itemsCall3)).toEqual(true);
            })),
        };

        const provider = new AtMentionProvider(params);
        const resultCallback = jest.fn();
        expect(provider.handlePretextChanged(pretext, resultCallback)).toEqual(true);

        expect(resultCallback).toHaveBeenNthCalledWith(1, {
            matchedPretext,
            terms: ['@software-engineers'],
            items: [
                {...groupid3, type: Constants.MENTION_GROUPS},
            ],
            component: AtMentionSuggestion,
        });
    });
});
