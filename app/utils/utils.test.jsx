// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import assert from 'assert';
import {GeneralTypes} from 'mattermost-redux/action_types';

import store from 'stores/redux_store.jsx';

import Constants, {ValidationErrors} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import * as lineBreakHelpers from 'tests/helpers/line_break_helpers.js';
import {makeBoldHotkeyEvent, makeItalicHotkeyEvent, makeSelectionEvent} from 'tests/helpers/markdown_hotkey_helpers.js';
import * as ua from 'tests/helpers/user_agent_mocks';

describe('Utils.getDisplayNameByUser', () => {
    afterEach(() => {
        store.dispatch({
            type: GeneralTypes.CLIENT_CONFIG_RESET,
            data: {},
        });
    });

    const userA = {username: 'a_user', nickname: 'a_nickname', first_name: 'a_first_name', last_name: ''};
    const userB = {username: 'b_user', nickname: 'b_nickname', first_name: '', last_name: 'b_last_name'};
    const userC = {username: 'c_user', nickname: '', first_name: 'c_first_name', last_name: 'c_last_name'};
    const userD = {username: 'd_user', nickname: 'd_nickname', first_name: 'd_first_name', last_name: 'd_last_name'};
    const userE = {username: 'e_user', nickname: '', first_name: 'e_first_name', last_name: 'e_last_name'};
    const userF = {username: 'f_user', nickname: 'f_nickname', first_name: 'f_first_name', last_name: 'f_last_name'};
    const userG = {username: 'g_user', nickname: '', first_name: 'g_first_name', last_name: 'g_last_name'};
    const userH = {username: 'h_user', nickname: 'h_nickname', first_name: '', last_name: 'h_last_name'};
    const userI = {username: 'i_user', nickname: 'i_nickname', first_name: 'i_first_name', last_name: ''};
    const userJ = {username: 'j_user', nickname: '', first_name: 'j_first_name', last_name: ''};

    test('Show display name of user with TeammateNameDisplay set to username', () => {
        store.dispatch({
            type: GeneralTypes.CLIENT_CONFIG_RECEIVED,
            data: {
                TeammateNameDisplay: 'username',
            },
        });

        [userA, userB, userC, userD, userE, userF, userG, userH, userI, userJ].forEach((user) => {
            expect(Utils.getDisplayNameByUser(store.getState(), user)).toEqual(user.username);
        });
    });

    test('Show display name of user with TeammateNameDisplay set to nickname_full_name', () => {
        store.dispatch({
            type: GeneralTypes.CLIENT_CONFIG_RECEIVED,
            data: {
                TeammateNameDisplay: 'nickname_full_name',
            },
        });

        for (const data of [
            {user: userA, result: userA.nickname},
            {user: userB, result: userB.nickname},
            {user: userC, result: `${userC.first_name} ${userC.last_name}`},
            {user: userD, result: userD.nickname},
            {user: userE, result: `${userE.first_name} ${userE.last_name}`},
            {user: userF, result: userF.nickname},
            {user: userG, result: `${userG.first_name} ${userG.last_name}`},
            {user: userH, result: userH.nickname},
            {user: userI, result: userI.nickname},
            {user: userJ, result: userJ.first_name},
        ]) {
            expect(Utils.getDisplayNameByUser(store.getState(), data.user)).toEqual(data.result);
        }
    });

    test('Show display name of user with TeammateNameDisplay set to username', () => {
        store.dispatch({
            type: GeneralTypes.CLIENT_CONFIG_RECEIVED,
            data: {
                TeammateNameDisplay: 'full_name',
            },
        });

        for (const data of [
            {user: userA, result: userA.first_name},
            {user: userB, result: userB.last_name},
            {user: userC, result: `${userC.first_name} ${userC.last_name}`},
            {user: userD, result: `${userD.first_name} ${userD.last_name}`},
            {user: userE, result: `${userE.first_name} ${userE.last_name}`},
            {user: userF, result: `${userF.first_name} ${userF.last_name}`},
            {user: userG, result: `${userG.first_name} ${userG.last_name}`},
            {user: userH, result: userH.last_name},
            {user: userI, result: userI.first_name},
            {user: userJ, result: userJ.first_name},
        ]) {
            expect(Utils.getDisplayNameByUser(store.getState(), data.user)).toEqual(data.result);
        }
    });
});

describe('Utils.sortUsersByStatusAndDisplayName', () => {
    afterEach(() => {
        store.dispatch({
            type: GeneralTypes.CLIENT_CONFIG_RESET,
            data: {},
        });
    });

    const userA = {id: 'a', username: 'a_user', nickname: 'ja_nickname', first_name: 'a_first_name', last_name: 'ja_last_name'};
    const userB = {id: 'b', username: 'b_user', nickname: 'ib_nickname', first_name: 'a_first_name', last_name: 'ib_last_name'};
    const userC = {id: 'c', username: 'c_user', nickname: 'hc_nickname', first_name: 'a_first_name', last_name: 'hc_last_name'};
    const userD = {id: 'd', username: 'd_user', nickname: 'gd_nickname', first_name: 'a_first_name', last_name: 'gd_last_name'};
    const userE = {id: 'e', username: 'e_user', nickname: 'fe_nickname', first_name: 'b_first_name', last_name: 'fe_last_name'};
    const userF = {id: 'f', username: 'f_user', nickname: 'ef_nickname', first_name: 'b_first_name', last_name: 'ef_last_name'};
    const userG = {id: 'g', username: 'g_user', nickname: 'dg_nickname', first_name: 'b_first_name', last_name: 'dg_last_name'};
    const userH = {id: 'h', username: 'h_user', nickname: 'ch_nickname', first_name: 'c_first_name', last_name: 'ch_last_name'};
    const userI = {id: 'i', username: 'i_user', nickname: 'bi_nickname', first_name: 'c_first_name', last_name: 'bi_last_name'};
    const userJ = {id: 'j', username: 'j_user', nickname: 'aj_nickname', first_name: 'c_first_name', last_name: 'aj_last_name'};
    const userK = {id: 'k', username: 'k_bot', nickname: 'ak_nickname', first_name: 'a_first_name', last_name: 'aABot_last_name', is_bot: true};
    const userL = {id: 'l', username: 'l_bot', nickname: 'al_nickname', first_name: 'b_first_name', last_name: 'aBBot_last_name', is_bot: true};
    const userM = {id: 'm', username: 'm_bot', nickname: 'am_nickname', first_name: 'c_first_name', last_name: 'aCBot_last_name', is_bot: true};
    const statusesByUserId = {
        a: 'dnd',
        b: 'away',
        c: 'offline',
        d: 'online',
        e: 'online',
        f: 'online',
        g: 'dnd',
        h: 'away',
        i: 'offline',
        j: 'online',
        k: 'offline',
        l: 'offline',
        m: 'offline',
    };

    test('Users sort by status and displayname, TeammateNameDisplay set to username', () => {
        store.dispatch({
            type: GeneralTypes.CLIENT_CONFIG_RECEIVED,
            data: {
                TeammateNameDisplay: 'username',
            },
        });

        for (const data of [
            {
                users: [userM, userK, userL, userF, userA, userB, userC, userD, userE],
                result: [userD, userE, userF, userB, userA, userC, userK, userL, userM],
            },
            {
                users: [userM, userL, userK, userJ, userI, userH, userG, userF, userE],
                result: [userE, userF, userJ, userH, userG, userI, userK, userL, userM],
            },
            {
                users: [userL, userM, userK, userJ, userF, userE, userD],
                result: [userD, userE, userF, userJ, userK, userL, userM],
            },
        ]) {
            const sortedUsers = Utils.sortUsersByStatusAndDisplayName(data.users, statusesByUserId, 'username');
            for (let i = 0; i < sortedUsers.length; i++) {
                expect(sortedUsers[i]).toEqual(data.result[i]);
            }
        }
    });

    test('Users sort by status and displayname, TeammateNameDisplay set to nickname_full_name', () => {
        store.dispatch({
            type: GeneralTypes.CLIENT_CONFIG_RECEIVED,
            data: {
                TeammateNameDisplay: 'nickname_full_name',
            },
        });

        for (const data of [
            {
                users: [userM, userK, userL, userF, userA, userB, userC, userD, userE],
                result: [userF, userE, userD, userB, userA, userC, userK, userL, userM],
            },
            {
                users: [userM, userL, userK, userJ, userI, userH, userG, userF, userE],
                result: [userJ, userF, userE, userH, userG, userI, userK, userL, userM],
            },
            {
                users: [userL, userM, userK, userJ, userF, userE, userD],
                result: [userJ, userF, userE, userD, userK, userL, userM],
            },
        ]) {
            const sortedUsers = Utils.sortUsersByStatusAndDisplayName(data.users, statusesByUserId, 'nickname_full_name');
            for (let i = 0; i < sortedUsers.length; i++) {
                expect(sortedUsers[i]).toEqual(data.result[i]);
            }
        }
    });

    test('Users sort by status and displayname, TeammateNameDisplay set to full_name', () => {
        store.dispatch({
            type: GeneralTypes.CLIENT_CONFIG_RECEIVED,
            data: {
                TeammateNameDisplay: 'full_name',
            },
        });

        for (const data of [
            {
                users: [userM, userK, userL, userF, userA, userB, userC, userD, userE],
                result: [userD, userF, userE, userB, userA, userC, userK, userL, userM],
            },
            {
                users: [userM, userL, userK, userJ, userI, userH, userG, userF, userE],
                result: [userF, userE, userJ, userH, userG, userI, userK, userL, userM],
            },
            {
                users: [userL, userM, userK, userJ, userF, userE, userD],
                result: [userD, userF, userE, userJ, userK, userL, userM],
            },
        ]) {
            const sortedUsers = Utils.sortUsersByStatusAndDisplayName(data.users, statusesByUserId, 'full_name');
            for (let i = 0; i < sortedUsers.length; i++) {
                expect(sortedUsers[i]).toEqual(data.result[i]);
            }
        }
    });
});

describe('Utils.isValidPassword', () => {
    test('Minimum length enforced', () => {
        for (const data of [
            {
                password: 'tooshort',
                config: {
                    minimumLength: 10,
                    requireLowercase: false,
                    requireUppercase: false,
                    requireNumber: false,
                    requireSymbol: false,
                },
                valid: false,
            },
            {
                password: 'longenoughpassword',
                config: {
                    minimumLength: 10,
                    requireLowercase: false,
                    requireUppercase: false,
                    requireNumber: false,
                    requireSymbol: false,
                },
                valid: true,
            },
        ]) {
            const {valid} = Utils.isValidPassword(data.password, data.config);
            expect(data.valid).toEqual(valid);
        }
    });

    test('Require lowercase enforced', () => {
        for (const data of [
            {
                password: 'UPPERCASE',
                config: {
                    minimumLength: 5,
                    requireLowercase: true,
                    requireUppercase: false,
                    requireNumber: false,
                    requireSymbol: false,
                },
                valid: false,
            },
            {
                password: 'SOMELowercase',
                config: {
                    minimumLength: 5,
                    requireLowercase: true,
                    requireUppercase: false,
                    requireNumber: false,
                    requireSymbol: false,
                },
                valid: true,
            },
        ]) {
            const {valid} = Utils.isValidPassword(data.password, data.config);
            expect(data.valid).toEqual(valid);
        }
    });

    test('Require uppercase enforced', () => {
        for (const data of [
            {
                password: 'lowercase',
                config: {
                    minimumLength: 5,
                    requireLowercase: false,
                    requireUppercase: true,
                    requireNumber: false,
                    requireSymbol: false,
                },
                valid: false,
            },
            {
                password: 'SOMEUppercase',
                config: {
                    minimumLength: 5,
                    requireLowercase: false,
                    requireUppercase: true,
                    requireNumber: false,
                    requireSymbol: false,
                },
                valid: true,
            },
        ]) {
            const {valid} = Utils.isValidPassword(data.password, data.config);
            expect(data.valid).toEqual(valid);
        }
    });

    test('Require number enforced', () => {
        for (const data of [
            {
                password: 'NoNumbers',
                config: {
                    minimumLength: 5,
                    requireLowercase: true,
                    requireUppercase: true,
                    requireNumber: true,
                    requireSymbol: false,
                },
                valid: false,
            },
            {
                password: 'S0m3Numb3rs',
                config: {
                    minimumLength: 5,
                    requireLowercase: true,
                    requireUppercase: true,
                    requireNumber: true,
                    requireSymbol: false,
                },
                valid: true,
            },
        ]) {
            const {valid} = Utils.isValidPassword(data.password, data.config);
            expect(data.valid).toEqual(valid);
        }
    });

    test('Require symbol enforced', () => {
        for (const data of [
            {
                password: 'N0Symb0ls',
                config: {
                    minimumLength: 5,
                    requireLowercase: true,
                    requireUppercase: true,
                    requireNumber: true,
                    requireSymbol: true,
                },
                valid: false,
            },
            {
                password: 'S0m3Symb0!s',
                config: {
                    minimumLength: 5,
                    requireLowercase: true,
                    requireUppercase: true,
                    requireNumber: true,
                    requireSymbol: true,
                },
                valid: true,
            },
        ]) {
            const {valid} = Utils.isValidPassword(data.password, data.config);
            expect(data.valid).toEqual(valid);
        }
    });
});

describe('Utils.isValidUsername', () => {
    const tests = [
        {
            testUserName: 'sonic.the.hedgehog',
            expectedError: undefined,
        }, {
            testUserName: null,
            expectedError: ValidationErrors.USERNAME_REQUIRED,
        }, {
            testUserName: 'sanic.the.speedy.errored.hedgehog@10_10-10',
            expectedError: ValidationErrors.INVALID_LENGTH,
        }, {
            testUserName: 'sanic⭑',
            expectedError: ValidationErrors.INVALID_CHARACTERS,
        }, {
            testUserName: '.sanic',
            expectedError: ValidationErrors.INVALID_FIRST_CHARACTER,
        }, {
            testUserName: 'valet',
            expectedError: ValidationErrors.RESERVED_NAME,
        },
    ];
    test('Validate username', () => {
        for (const test of tests) {
            const testError = Utils.isValidUsername(test.testUserName);
            if (testError) {
                expect(testError.id).toEqual(test.expectedError);
            } else {
                expect(testError).toBe(undefined);
            }
        }
    });
    test('Validate bot username', () => {
        tests.push({
            testUserName: 'sanic.the.hedgehog.',
            expectedError: ValidationErrors.INVALID_LAST_CHARACTER,
        });
        for (const test of tests) {
            const testError = Utils.isValidUsername(test.testUserName);
            if (testError) {
                expect(testError.id).toEqual(test.expectedError);
            } else {
                expect(testError).toBe(undefined);
            }
        }
    });
});

describe('Utils.isKeyPressed', () => {
    test('Key match is used over keyCode if it exists', () => {
        for (const data of [
            {
                event: new KeyboardEvent('keydown', {key: '/', keyCode: 55}),
                key: ['/', 191, 'Slash'],
                valid: true,
            },
            {
                event: new KeyboardEvent('keydown', {key: 'ù', keyCode: 191}),
                key: ['/', 191, 'Slash'],
                valid: true,
            },
        ]) {
            expect(Utils.isKeyPressed(data.event, data.key)).toEqual(data.valid);
        }
    });

    test('Key match works for both uppercase and lower case', () => {
        for (const data of [
            {
                event: new KeyboardEvent('keydown', {key: 'A', keyCode: 65, code: 'KeyA'}),
                key: ['a', 65, 'KeyA'],
                valid: true,
            },
            {
                event: new KeyboardEvent('keydown', {key: 'a', keyCode: 65, code: 'KeyA'}),
                key: ['a', 65, 'KeyA'],
                valid: true,
            },
        ]) {
            expect(Utils.isKeyPressed(data.event, data.key)).toEqual(data.valid);
        }
    });

    test('KeyCode is used for dead letter keys', () => {
        for (const data of [
            {
                event: new KeyboardEvent('keydown', {key: 'Dead', keyCode: 222}),
                key: ['', 222],
                valid: true,
            },
            {
                event: new KeyboardEvent('keydown', {key: 'Dead', keyCode: 222}),
                key: ['not-used-field', 222],
                valid: true,
            },
            {
                event: new KeyboardEvent('keydown', {key: 'Dead', keyCode: 222}),
                key: [null, 222],
                valid: true,
            },
            {
                event: new KeyboardEvent('keydown', {key: 'Dead', keyCode: 222}),
                key: [null, 223],
                valid: false,
            },
        ]) {
            expect(Utils.isKeyPressed(data.event, data.key)).toEqual(data.valid);
        }
    });

    test('KeyCode is used for unidentified keys', () => {
        for (const data of [
            {
                event: new KeyboardEvent('keydown', {key: 'Unidentified', keyCode: 2220, code: 'Unidentified'}),
                key: ['', 2220],
                valid: true,
            },
            {
                event: new KeyboardEvent('keydown', {key: 'Unidentified', keyCode: 2220, code: 'Unidentified'}),
                key: ['not-used-field', 2220],
                valid: true,
            },
            {
                event: new KeyboardEvent('keydown', {key: 'Unidentified', keyCode: 2220, code: 'Unidentified'}),
                key: [null, 2220],
                valid: true,
            },
            {
                event: new KeyboardEvent('keydown', {key: 'Unidentified', keyCode: 2220, code: 'Unidentified'}),
                key: [null, 2221],
                valid: false,
            },
        ]) {
            expect(Utils.isKeyPressed(data.event, data.key)).toEqual(data.valid);
        }
    });

    test('KeyCode is used for undefined keys', () => {
        for (const data of [
            {
                event: {keyCode: 2221},
                key: ['', 2221],
                valid: true,
            },
            {
                event: {keyCode: 2221},
                key: ['not-used-field', 2221],
                valid: true,
            },
            {
                event: {keyCode: 2221},
                key: [null, 2221],
                valid: true,
            },
            {
                event: {keyCode: 2221},
                key: [null, 2222],
                valid: false,
            },
        ]) {
            expect(Utils.isKeyPressed(data.event, data.key)).toEqual(data.valid);
        }
    });

    test('keyCode is used for determining if it exists', () => {
        for (const data of [
            {
                event: {key: 'a', keyCode: 65},
                key: ['k', 65],
                valid: true,
            },
            {
                event: {key: 'b', keyCode: 66},
                key: ['y', 66],
                valid: true,
            },
        ]) {
            expect(Utils.isKeyPressed(data.event, data.key)).toEqual(data.valid);
        }
    });

    test('key should be tested as fallback for different layout of english keyboards', () => {
        //key will be k for keyboards like dvorak but code will be keyV as `v` is pressed
        const event = {key: 'k', code: 'KeyV'};
        const key = ['k', 2221];
        expect(Utils.isKeyPressed(event, key)).toEqual(true);
    });
});

describe('Utils.localizeMessage', () => {
    const originalGetState = store.getState;

    afterAll(() => {
        store.getState = originalGetState;
    });

    const entities = {
        general: {
            config: {},
        },
        users: {
            currentUserId: 'abcd',
            profiles: {
                abcd: {
                    locale: 'fr',
                },
            },
        },
    };

    describe('with translations', () => {
        beforeAll(() => {
            store.getState = () => ({
                entities,
                views: {
                    i18n: {
                        translations: {
                            fr: {
                                'test.hello_world': 'Bonjour tout le monde!',
                            },
                        },
                    },
                },
            });
        });

        test('with translations', () => {
            expect(Utils.localizeMessage('test.hello_world', 'Hello, World!')).toEqual('Bonjour tout le monde!');
        });

        test('with missing string in translations', () => {
            expect(Utils.localizeMessage('test.hello_world2', 'Hello, World 2!')).toEqual('Hello, World 2!');
        });

        test('with missing string in translations and no default', () => {
            expect(Utils.localizeMessage('test.hello_world2')).toEqual('test.hello_world2');
        });
    });

    describe('without translations', () => {
        beforeAll(() => {
            store.getState = () => ({
                entities,
                views: {
                    i18n: {
                        translations: {},
                    },
                },
            });
        });

        test('without translations', () => {
            expect(Utils.localizeMessage('test.hello_world', 'Hello, World!')).toEqual('Hello, World!');
        });

        test('without translations and no default', () => {
            expect(Utils.localizeMessage('test.hello_world')).toEqual('test.hello_world');
        });
    });
});

describe('Utils.isDevMode', () => {
    const originalGetState = store.getState;

    afterAll(() => {
        store.getState = originalGetState;
    });

    describe('dev mode off', () => {
        beforeAll(() => {
            store.getState = () => ({
                entities: {
                    general: {
                        config: {},
                    },
                },
            });
        });

        test('with missing EnableDeveloper field', () => {
            expect(Utils.isDevMode()).toEqual(false);
        });

        test('with EnableDeveloper field set to false', () => {
            store.getState = () => ({
                entities: {
                    general: {
                        config: {
                            EnableDeveloper: 'false',
                        },
                    },
                },
            });
            expect(Utils.isDevMode()).toEqual(false);
        });

        test('with EnableDeveloper field set to false bool', () => {
            store.getState = () => ({
                entities: {
                    general: {
                        config: {
                            EnableDeveloper: false,
                        },
                    },
                },
            });
            expect(Utils.isDevMode()).toEqual(false);
        });

        test('with EnableDeveloper field set to true bool', () => {
            store.getState = () => ({
                entities: {
                    general: {
                        config: {
                            EnableDeveloper: true,
                        },
                    },
                },
            });
            expect(Utils.isDevMode()).toEqual(false);
        });

        test('with EnableDeveloper field set to null', () => {
            store.getState = () => ({
                entities: {
                    general: {
                        config: {
                            EnableDeveloper: null,
                        },
                    },
                },
            });
            expect(Utils.isDevMode()).toEqual(false);
        });
    });

    describe('dev mode on', () => {
        beforeAll(() => {
            store.getState = () => ({
                entities: {
                    general: {
                        config: {},
                    },
                },
            });
        });

        test('with EnableDeveloper field set to true text', () => {
            store.getState = () => ({
                entities: {
                    general: {
                        config: {
                            EnableDeveloper: 'true',
                        },
                    },
                },
            });
            expect(Utils.isDevMode()).toEqual(true);
        });
    });
});

describe('Utils.enableDevModeFeatures', () => {
    const cleanUp = () => {
        delete Map.prototype.length;
        delete Set.prototype.length;
    };

    beforeEach(cleanUp);
    afterEach(cleanUp);

    describe('with DevModeFeatures', () => {
        beforeEach(cleanUp);
        afterEach(cleanUp);

        test('invoke Map.Length', () => {
            Utils.enableDevModeFeatures();
            expect(() => new Map().length).toThrow(Error);
        });

        test('invoke Set.Length', () => {
            Utils.enableDevModeFeatures();
            expect(() => new Set().length).toThrow(Error);
        });
    });

    describe('without DevModeFeatures', () => {
        test('invoke Map.Length', () => {
            expect(new Map().length).toEqual(undefined);
        });

        test('invoke Set.Length', () => {
            expect(new Set().length).toEqual(undefined);
        });
    });
});

describe('Utils.getSortedUsers', () => {
    test('should sort users by who reacted first', () => {
        const baseDate = Date.now();
        const currentUserId = 'user_id_1';
        const profiles = [{id: 'user_id_1', username: 'username_1'}, {id: 'user_id_2', username: 'username_2'}, {id: 'user_id_3', username: 'username_3'}];
        const reactions = [
            {user_id: 'user_id_2', create_at: baseDate}, // Will be sorted 2nd, after the logged-in user
            {user_id: 'user_id_1', create_at: baseDate + 5000}, // Logged-in user, will be sorted first although 2nd user reacted first
            {user_id: 'user_id_3', create_at: baseDate + 8000}, // Last to react, will be sorted last
        ];

        const {currentUserReacted, users} = Utils.getSortedUsers(reactions, currentUserId, profiles, 'username');

        expect(currentUserReacted).toEqual(true);
        assert.deepEqual(
            users,
            ['You', 'username_2', 'username_3'],
        );
    });
});

describe('Utils.imageURLForUser', () => {
    test('should return url when user id and last_picture_update is given', () => {
        const imageUrl = Utils.imageURLForUser('foobar-123', 123456);
        expect(imageUrl).toEqual('/api/v4/users/foobar-123/image?_=123456');
    });

    test('should return url when user id is given without last_picture_update', () => {
        const imageUrl = Utils.imageURLForUser('foobar-123');
        expect(imageUrl).toEqual('/api/v4/users/foobar-123/image?_=0');
    });
});

describe('Utils.isUnhandledLineBreakKeyCombo', () => {
    test('isUnhandledLineBreakKeyCombo returns true for alt + enter for Chrome UA', () => {
        ua.mockChrome();
        expect(Utils.isUnhandledLineBreakKeyCombo(lineBreakHelpers.getAltKeyEvent())).toBe(true);
    });

    test('isUnhandledLineBreakKeyCombo returns false for alt + enter for Safari UA', () => {
        ua.mockSafari();
        expect(Utils.isUnhandledLineBreakKeyCombo(lineBreakHelpers.getAltKeyEvent())).toBe(false);
    });

    test('isUnhandledLineBreakKeyCombo returns false for shift + enter', () => {
        expect(Utils.isUnhandledLineBreakKeyCombo(lineBreakHelpers.getShiftKeyEvent())).toBe(false);
    });

    test('isUnhandledLineBreakKeyCombo returns false for ctrl/command + enter', () => {
        expect(Utils.isUnhandledLineBreakKeyCombo(lineBreakHelpers.getCtrlKeyEvent())).toBe(false);
        expect(Utils.isUnhandledLineBreakKeyCombo(lineBreakHelpers.getMetaKeyEvent())).toBe(false);
    });

    test('isUnhandledLineBreakKeyCombo returns false for just enter', () => {
        expect(Utils.isUnhandledLineBreakKeyCombo(lineBreakHelpers.BASE_EVENT)).toBe(false);
    });

    test('isUnhandledLineBreakKeyCombo returns false for f (random key)', () => {
        const e = {
            ...lineBreakHelpers.BASE_EVENT,
            key: Constants.KeyCodes.F[0],
            keyCode: Constants.KeyCodes.F[1],
        };
        expect(Utils.isUnhandledLineBreakKeyCombo(e)).toBe(false);
    });

    // restore initial user agent
    afterEach(ua.reset);
});

describe('Utils.insertLineBreakFromKeyEvent', () => {
    test('insertLineBreakFromKeyEvent returns with line break appending (no selection range)', () => {
        expect(Utils.insertLineBreakFromKeyEvent(lineBreakHelpers.getAppendEvent())).toBe(lineBreakHelpers.OUTPUT_APPEND);
    });
    test('insertLineBreakFromKeyEvent returns with line break replacing (with selection range)', () => {
        expect(Utils.insertLineBreakFromKeyEvent(lineBreakHelpers.getReplaceEvent())).toBe(lineBreakHelpers.OUTPUT_REPLACE);
    });
});

describe('Utils.applyHotkeyMarkdown', () => {
    test('applyHotkeyMarkdown returns correct markdown for bold hotkey', () => {
        // "Fafda" is selected with ctrl + B hotkey
        const e = makeBoldHotkeyEvent('Jalebi Fafda & Sambharo', 7, 12);

        expect(Utils.applyHotkeyMarkdown(e)).
            toEqual({
                message: 'Jalebi **Fafda** & Sambharo',
                selectionStart: 9,
                selectionEnd: 14,
            });
    });

    test('applyHotkeyMarkdown returns correct markdown for undo bold', () => {
        // "Fafda" is selected with ctrl + B hotkey
        const e = makeBoldHotkeyEvent('Jalebi **Fafda** & Sambharo', 9, 14);

        expect(Utils.applyHotkeyMarkdown(e)).
            toEqual({
                message: 'Jalebi Fafda & Sambharo',
                selectionStart: 7,
                selectionEnd: 12,
            });
    });

    test('applyHotkeyMarkdown returns correct markdown for italic hotkey', () => {
        // "Fafda" is selected with ctrl + I hotkey
        const e = makeItalicHotkeyEvent('Jalebi Fafda & Sambharo', 7, 12);

        expect(Utils.applyHotkeyMarkdown(e)).
            toEqual({
                message: 'Jalebi *Fafda* & Sambharo',
                selectionStart: 8,
                selectionEnd: 13,
            });
    });

    test('applyHotkeyMarkdown returns correct markdown for undo italic', () => {
        // "Fafda" is selected with ctrl + I hotkey
        const e = makeItalicHotkeyEvent('Jalebi *Fafda* & Sambharo', 8, 13);

        expect(Utils.applyHotkeyMarkdown(e)).
            toEqual({
                message: 'Jalebi Fafda & Sambharo',
                selectionStart: 7,
                selectionEnd: 12,
            });
    });

    test('applyHotkeyMarkdown returns correct markdown for bold hotkey and empty', () => {
        // Nothing is selected with ctrl + B hotkey and caret is just before "Fafda"
        const e = makeBoldHotkeyEvent('Jalebi Fafda & Sambharo', 7, 7);

        expect(Utils.applyHotkeyMarkdown(e)).
            toEqual({
                message: 'Jalebi ****Fafda & Sambharo',
                selectionStart: 9,
                selectionEnd: 9,
            });
    });

    test('applyHotkeyMarkdown returns correct markdown for italic hotkey and empty', () => {
        // Nothing is selected with ctrl + I hotkey and caret is just before "Fafda"
        const e = makeItalicHotkeyEvent('Jalebi Fafda & Sambharo', 7, 7);

        expect(Utils.applyHotkeyMarkdown(e)).
            toEqual({
                message: 'Jalebi **Fafda & Sambharo',
                selectionStart: 8,
                selectionEnd: 8,
            });
    });

    test('applyHotkeyMarkdown returns correct markdown for italic with bold', () => {
        // "Fafda" is selected with ctrl + I hotkey
        const e = makeItalicHotkeyEvent('Jalebi **Fafda** & Sambharo', 9, 14);

        expect(Utils.applyHotkeyMarkdown(e)).
            toEqual({
                message: 'Jalebi ***Fafda*** & Sambharo',
                selectionStart: 10,
                selectionEnd: 15,
            });
    });

    test('applyHotkeyMarkdown returns correct markdown for bold with italic', () => {
        // "Fafda" is selected with ctrl + B hotkey
        const e = makeBoldHotkeyEvent('Jalebi *Fafda* & Sambharo', 8, 13);

        expect(Utils.applyHotkeyMarkdown(e)).
            toEqual({
                message: 'Jalebi ***Fafda*** & Sambharo',
                selectionStart: 10,
                selectionEnd: 15,
            });
    });

    test('applyHotkeyMarkdown returns correct markdown for bold with italic+bold', () => {
        // "Fafda" is selected with ctrl + B hotkey
        const e = makeBoldHotkeyEvent('Jalebi ***Fafda*** & Sambharo', 10, 15);

        // Should undo bold
        expect(Utils.applyHotkeyMarkdown(e)).
            toEqual({
                message: 'Jalebi *Fafda* & Sambharo',
                selectionStart: 8,
                selectionEnd: 13,
            });
    });

    test('applyHotkeyMarkdown returns correct markdown for italic with italic+bold', () => {
        // "Fafda" is selected with ctrl + I hotkey
        const e = makeItalicHotkeyEvent('Jalebi ***Fafda*** & Sambharo', 10, 15);

        // Should undo italic
        expect(Utils.applyHotkeyMarkdown(e)).
            toEqual({
                message: 'Jalebi **Fafda** & Sambharo',
                selectionStart: 9,
                selectionEnd: 14,
            });
    });
});

describe('Utils.adjustSelection', () => {
    test('adjustSelection fixes selection to correct text', () => {
        // "_Fafda_" is selected
        const e = makeSelectionEvent('Jalebi _Fafda_ and Sambharo', 7, 14);
        const input = {
            focus: jest.fn(),
            setSelectionRange: jest.fn(),
        };

        Utils.adjustSelection(input, e);
        expect(input.setSelectionRange).toHaveBeenCalledWith(8, 13);
    });

    test('adjustSelection does not fix selection when selected text does not end with "_"', () => {
        // "_Fafda" is selected
        const e = makeSelectionEvent('Jalebi _Fafda and Sambharo', 7, 13);
        const input = {
            focus: jest.fn(),
            setSelectionRange: jest.fn(),
        };

        Utils.adjustSelection(input, e);
        expect(input.setSelectionRange).not.toHaveBeenCalled();
    });

    test('adjustSelection does not fix selection when selected text does start end with "_"', () => {
        // "Fafda_" is selected
        const e = makeSelectionEvent('Jalebi Fafda_ and Sambharo', 7, 13);
        const input = {
            focus: jest.fn(),
            setSelectionRange: jest.fn(),
        };

        Utils.adjustSelection(input, e);
        expect(input.setSelectionRange).not.toHaveBeenCalled();
    });

    test('adjustSelection fixes selection at start of text', () => {
        // "_Jalebi_" is selected
        const e = makeSelectionEvent('_Jalebi_ Fafda and Sambharo', 0, 8);
        const input = {
            focus: jest.fn(),
            setSelectionRange: jest.fn(),
        };

        Utils.adjustSelection(input, e);
        expect(input.setSelectionRange).toHaveBeenCalledWith(1, 7);
    });

    test('adjustSelection fixes selection at end of text', () => {
        // "_Sambharo_" is selected
        const e = makeSelectionEvent('Jalebi Fafda and _Sambharo_', 17, 27);
        const input = {
            focus: jest.fn(),
            setSelectionRange: jest.fn(),
        };

        Utils.adjustSelection(input, e);
        expect(input.setSelectionRange).toHaveBeenCalledWith(18, 26);
    });
});
