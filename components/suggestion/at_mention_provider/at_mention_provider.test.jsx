// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Constants} from 'utils/constants.jsx';
import AtMentionProvider from 'components/suggestion/at_mention_provider/at_mention_provider.jsx';
import AtMentionSuggestion from 'components/suggestion/at_mention_provider/at_mention_suggestion.jsx';

describe('components/suggestion/at_mention_provider/AtMentionProvider', () => {
    const userid10 = {id: 'userid10', username: 'nicknamer', first_name: '', last_name: '', nickname: 'Z'};
    const userid3 = {id: 'userid3', username: 'other', first_name: 'X', last_name: 'Y', nickname: 'Z'};
    const userid1 = {id: 'userid1', username: 'user', first_name: 'a', last_name: 'b', nickname: 'c'};
    const userid2 = {id: 'userid2', username: 'user2', first_name: 'd', last_name: 'e', nickname: 'f'};
    const userid4 = {id: 'userid4', username: 'user4', first_name: 'X', last_name: 'Y', nickname: 'Z'};
    const userid5 = {id: 'userid5', username: 'user5', first_name: 'out', last_name: 'out', nickname: 'out'};
    const userid6 = {id: 'userid6', username: 'user.six-split', first_name: 'out Junior', last_name: 'out', nickname: 'out'};

    const baseParams = {
        currentUserId: 'userid1',
        profilesInChannel: [userid10, userid3, userid1, userid2],
        autocompleteUsersInChannel: jest.fn().mockResolvedValue(false),
    };

    it('should ignore pretexts that are not at-mentions', () => {
        const provider = new AtMentionProvider(baseParams);
        const resultCallback = jest.fn();
        expect(provider.handlePretextChanged('', resultCallback)).toEqual(false);
        expect(provider.handlePretextChanged('user', resultCallback)).toEqual(false);
        expect(provider.handlePretextChanged('this is a sentence', resultCallback)).toEqual(false);
        expect(baseParams.autocompleteUsersInChannel).not.toHaveBeenCalled();
    });

    it('should suggest for "@"', async () => {
        const pretext = '@';
        const matchedPretext = '@';
        const params = {
            ...baseParams,
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => new Promise((resolve) => {
                resolve({data: {
                    users: [userid4],
                    out_of_channel: [userid5, userid6],
                }});
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
                '@user2',
                '@here',
                '@channel',
                '@all',
            ],
            items: [
                {type: Constants.MENTION_MEMBERS, ...userid10},
                {type: Constants.MENTION_MEMBERS, ...userid3},
                {type: Constants.MENTION_MEMBERS, ...userid2},
                {type: Constants.MENTION_SPECIAL, username: 'here'},
                {type: Constants.MENTION_SPECIAL, username: 'channel'},
                {type: Constants.MENTION_SPECIAL, username: 'all'},
            ],
            component: AtMentionSuggestion,
        });

        jest.runAllTimers();

        expect(resultCallback).toHaveBeenNthCalledWith(2, {
            matchedPretext,
            terms: [
                '@nicknamer',
                '@other',
                '@user2',
                '@here',
                '@channel',
                '@all',
                '',
            ],
            items: [
                {type: Constants.MENTION_MEMBERS, ...userid10},
                {type: Constants.MENTION_MEMBERS, ...userid3},
                {type: Constants.MENTION_MEMBERS, ...userid2},
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
                    '@user2',
                    '@user4',
                    '@here',
                    '@channel',
                    '@all',
                    '@user5',
                    '@user.six-split',
                ],
                items: [
                    {type: Constants.MENTION_MEMBERS, ...userid10},
                    {type: Constants.MENTION_MEMBERS, ...userid3},
                    {type: Constants.MENTION_MEMBERS, ...userid2},
                    {type: Constants.MENTION_MEMBERS, ...userid4},
                    {type: Constants.MENTION_SPECIAL, username: 'here'},
                    {type: Constants.MENTION_SPECIAL, username: 'channel'},
                    {type: Constants.MENTION_SPECIAL, username: 'all'},
                    {type: Constants.MENTION_NONMEMBERS, ...userid5},
                    {type: Constants.MENTION_NONMEMBERS, ...userid6},
                ],
                component: AtMentionSuggestion,
            });
        });
    });

    it('should suggest for "@", skipping the loading indicator if results load quickly', async () => {
        const pretext = '@';
        const matchedPretext = '@';
        const params = {
            ...baseParams,
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => new Promise((resolve) => {
                resolve({data: {
                    users: [userid4],
                    out_of_channel: [userid5, userid6],
                }});
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
                '@user2',
                '@here',
                '@channel',
                '@all',
            ],
            items: [
                {type: Constants.MENTION_MEMBERS, ...userid10},
                {type: Constants.MENTION_MEMBERS, ...userid3},
                {type: Constants.MENTION_MEMBERS, ...userid2},
                {type: Constants.MENTION_SPECIAL, username: 'here'},
                {type: Constants.MENTION_SPECIAL, username: 'channel'},
                {type: Constants.MENTION_SPECIAL, username: 'all'},
            ],
            component: AtMentionSuggestion,
        });

        await Promise.resolve().then(() => {
            jest.runAllTimers();

            expect(resultCallback).toHaveBeenNthCalledWith(2, {
                matchedPretext,
                terms: [
                    '@nicknamer',
                    '@other',
                    '@user2',
                    '@user4',
                    '@here',
                    '@channel',
                    '@all',
                    '@user5',
                    '@user.six-split',
                ],
                items: [
                    {type: Constants.MENTION_MEMBERS, ...userid10},
                    {type: Constants.MENTION_MEMBERS, ...userid3},
                    {type: Constants.MENTION_MEMBERS, ...userid2},
                    {type: Constants.MENTION_MEMBERS, ...userid4},
                    {type: Constants.MENTION_SPECIAL, username: 'here'},
                    {type: Constants.MENTION_SPECIAL, username: 'channel'},
                    {type: Constants.MENTION_SPECIAL, username: 'all'},
                    {type: Constants.MENTION_NONMEMBERS, ...userid5},
                    {type: Constants.MENTION_NONMEMBERS, ...userid6},
                ],
                component: AtMentionSuggestion,
            });
        });
    });

    it('should suggest for "@h"', async () => {
        const pretext = '@h';
        const matchedPretext = '@h';
        const params = {
            ...baseParams,
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => new Promise((resolve) => {
                resolve({data: {
                    users: [],
                    out_of_channel: [],
                }});
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

        jest.runAllTimers();

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
                items: [
                    {type: Constants.MENTION_SPECIAL, username: 'here'},
                ],
                component: AtMentionSuggestion,
            });
        });
    });

    it('should suggest for username match "@user"', async () => {
        const pretext = '@user';
        const matchedPretext = '@user';
        const params = {
            ...baseParams,
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => new Promise((resolve) => {
                resolve({data: {
                    users: [userid4],
                    out_of_channel: [userid5, userid6],
                }});
            })),
        };

        const provider = new AtMentionProvider(params);
        const resultCallback = jest.fn();
        expect(provider.handlePretextChanged(pretext, resultCallback)).toEqual(true);

        expect(resultCallback).toHaveBeenNthCalledWith(1, {
            matchedPretext,
            terms: [
                '@user2',
            ],
            items: [
                {type: Constants.MENTION_MEMBERS, ...userid2},
            ],
            component: AtMentionSuggestion,
        });

        jest.runAllTimers();
        expect(resultCallback).toHaveBeenNthCalledWith(2, {
            matchedPretext,
            terms: [
                '@user2',
                '',
            ],
            items: [
                {type: Constants.MENTION_MEMBERS, ...userid2},
                {type: Constants.MENTION_MORE_MEMBERS, loading: true},
            ],
            component: AtMentionSuggestion,
        });

        await Promise.resolve().then(() => {
            expect(resultCallback).toHaveBeenNthCalledWith(3, {
                matchedPretext,
                terms: [
                    '@user2',
                    '@user4',
                    '@user5',
                    '@user.six-split',
                ],
                items: [
                    {type: Constants.MENTION_MEMBERS, ...userid2},
                    {type: Constants.MENTION_MEMBERS, ...userid4},
                    {type: Constants.MENTION_NONMEMBERS, ...userid5},
                    {type: Constants.MENTION_NONMEMBERS, ...userid6},
                ],
                component: AtMentionSuggestion,
            });
        });
    });

    it('should suggest for username match "@six"', async () => {
        const pretext = '@six';
        const matchedPretext = '@six';
        const params = {
            ...baseParams,
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => new Promise((resolve) => {
                resolve({data: {
                    users: [userid4],
                    out_of_channel: [userid5, userid6],
                }});
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

        jest.runAllTimers();

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
                    '@user.six-split',
                ],
                items: [
                    {type: Constants.MENTION_NONMEMBERS, ...userid6},
                ],
                component: AtMentionSuggestion,
            });
        });
    });

    it('should suggest for username match "@split"', async () => {
        const pretext = '@split';
        const matchedPretext = '@split';
        const params = {
            ...baseParams,
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => new Promise((resolve) => {
                resolve({data: {
                    users: [userid4],
                    out_of_channel: [userid5, userid6],
                }});
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

        jest.runAllTimers();

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
                    '@user.six-split',
                ],
                items: [
                    {type: Constants.MENTION_NONMEMBERS, ...userid6},
                ],
                component: AtMentionSuggestion,
            });
        });
    });

    it('should suggest for username match "@-split"', async () => {
        const pretext = '@-split';
        const matchedPretext = '@-split';
        const params = {
            ...baseParams,
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => new Promise((resolve) => {
                resolve({data: {
                    users: [],
                    out_of_channel: [userid6],
                }});
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

        jest.runAllTimers();
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
                    '@user.six-split',
                ],
                items: [
                    {type: Constants.MENTION_NONMEMBERS, ...userid6},
                ],
                component: AtMentionSuggestion,
            });
        });
    });

    it('should suggest for username match "@junior"', async () => {
        const pretext = '@junior';
        const matchedPretext = '@junior';
        const params = {
            ...baseParams,
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => new Promise((resolve) => {
                resolve({data: {
                    users: [],
                    out_of_channel: [userid6],
                }});
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

        jest.runAllTimers();

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
                    '@user.six-split',
                ],
                items: [
                    {type: Constants.MENTION_NONMEMBERS, ...userid6},
                ],
                component: AtMentionSuggestion,
            });
        });
    });

    it('should suggest for first_name match "@X"', async () => {
        const pretext = '@X';
        const matchedPretext = '@x';
        const params = {
            ...baseParams,
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => new Promise((resolve) => {
                resolve({data: {
                    users: [userid4],
                    out_of_channel: [],
                }});
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
                {type: Constants.MENTION_MEMBERS, ...userid3},
            ],
            component: AtMentionSuggestion,
        });

        jest.runAllTimers();

        expect(resultCallback).toHaveBeenNthCalledWith(2, {
            matchedPretext,
            terms: [
                '@other',
                '',
            ],
            items: [
                {type: Constants.MENTION_MEMBERS, ...userid3},
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
                items: [
                    {type: Constants.MENTION_MEMBERS, ...userid3},
                    {type: Constants.MENTION_MEMBERS, ...userid4},
                ],
                component: AtMentionSuggestion,
            });
        });
    });

    it('should suggest for last_name match "@Y"', async () => {
        const pretext = '@Y';
        const matchedPretext = '@y';
        const params = {
            ...baseParams,
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => new Promise((resolve) => {
                resolve({data: {
                    users: [userid4],
                    out_of_channel: [],
                }});
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
                {type: Constants.MENTION_MEMBERS, ...userid3},
            ],
            component: AtMentionSuggestion,
        });

        jest.runAllTimers();

        expect(resultCallback).toHaveBeenNthCalledWith(2, {
            matchedPretext,
            terms: [
                '@other',
                '',
            ],
            items: [
                {type: Constants.MENTION_MEMBERS, ...userid3},
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
                items: [
                    {type: Constants.MENTION_MEMBERS, ...userid3},
                    {type: Constants.MENTION_MEMBERS, ...userid4},
                ],
                component: AtMentionSuggestion,
            });
        });
    });

    it('should suggest for nickname match "@Z"', async () => {
        const pretext = '@Z';
        const matchedPretext = '@z';
        const params = {
            ...baseParams,
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => new Promise((resolve) => {
                resolve({data: {
                    users: [userid4],
                    out_of_channel: [],
                }});
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
                {type: Constants.MENTION_MEMBERS, ...userid10},
                {type: Constants.MENTION_MEMBERS, ...userid3},
            ],
            component: AtMentionSuggestion,
        });

        jest.runAllTimers();

        expect(resultCallback).toHaveBeenNthCalledWith(2, {
            matchedPretext,
            terms: [
                '@nicknamer',
                '@other',
                '',
            ],
            items: [
                {type: Constants.MENTION_MEMBERS, ...userid10},
                {type: Constants.MENTION_MEMBERS, ...userid3},
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
                items: [
                    {type: Constants.MENTION_MEMBERS, ...userid10},
                    {type: Constants.MENTION_MEMBERS, ...userid3},
                    {type: Constants.MENTION_MEMBERS, ...userid4},
                ],
                component: AtMentionSuggestion,
            });
        });
    });

    it('should suggest ignore out_of_channel if found locally', async () => {
        const pretext = '@user';
        const matchedPretext = '@user';
        const params = {
            ...baseParams,
            autocompleteUsersInChannel: jest.fn().mockImplementation(() => new Promise((resolve) => {
                resolve({data: {
                    users: [userid4],
                    out_of_channel: [userid2, userid5, userid6],
                }});
            })),
        };

        const provider = new AtMentionProvider(params);
        const resultCallback = jest.fn();
        expect(provider.handlePretextChanged(pretext, resultCallback)).toEqual(true);

        expect(resultCallback).toHaveBeenNthCalledWith(1, {
            matchedPretext,
            terms: [
                '@user2',
            ],
            items: [
                {type: Constants.MENTION_MEMBERS, ...userid2},
            ],
            component: AtMentionSuggestion,
        });

        jest.runAllTimers();

        expect(resultCallback).toHaveBeenNthCalledWith(2, {
            matchedPretext,
            terms: [
                '@user2',
                '',
            ],
            items: [
                {type: Constants.MENTION_MEMBERS, ...userid2},
                {type: Constants.MENTION_MORE_MEMBERS, loading: true},
            ],
            component: AtMentionSuggestion,
        });

        await Promise.resolve().then(() => {
            expect(resultCallback).toHaveBeenNthCalledWith(3, {
                matchedPretext,
                terms: [
                    '@user2',
                    '@user4',
                    '@user5',
                    '@user.six-split',
                ],
                items: [
                    {type: Constants.MENTION_MEMBERS, ...userid2},
                    {type: Constants.MENTION_MEMBERS, ...userid4},
                    {type: Constants.MENTION_NONMEMBERS, ...userid5},
                    {type: Constants.MENTION_NONMEMBERS, ...userid6},
                ],
                component: AtMentionSuggestion,
            });
        });
    });
});
