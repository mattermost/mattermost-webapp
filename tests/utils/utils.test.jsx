// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {GeneralTypes} from 'mattermost-redux/action_types';

import * as Utils from 'utils/utils.jsx';
import store from 'stores/redux_store.jsx';

describe('Utils.getDisplayNameByUser', function() {
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

    test('Show display name of user with TeammateNameDisplay set to username', function() {
        store.dispatch({
            type: GeneralTypes.CLIENT_CONFIG_RECEIVED,
            data: {
                TeammateNameDisplay: 'username',
            },
        });

        [userA, userB, userC, userD, userE, userF, userG, userH, userI, userJ].forEach((user) => {
            expect(Utils.getDisplayNameByUser(user)).toEqual(user.username);
        });
    });

    test('Show display name of user with TeammateNameDisplay set to nickname_full_name', function() {
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
            expect(Utils.getDisplayNameByUser(data.user)).toEqual(data.result);
        }
    });

    test('Show display name of user with TeammateNameDisplay set to username', function() {
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
            expect(Utils.getDisplayNameByUser(data.user)).toEqual(data.result);
        }
    });
});

describe('Utils.sortUsersByStatusAndDisplayName', function() {
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
    };

    test('Users sort by status and displayname, TeammateNameDisplay set to username', function() {
        store.dispatch({
            type: GeneralTypes.CLIENT_CONFIG_RECEIVED,
            data: {
                TeammateNameDisplay: 'username',
            },
        });

        for (const data of [
            {
                users: [userF, userA, userB, userC, userD, userE],
                result: [userD, userE, userF, userB, userA, userC],
            },
            {
                users: [userJ, userI, userH, userG, userF, userE],
                result: [userE, userF, userJ, userH, userG, userI],
            },
            {
                users: [userJ, userF, userE, userD],
                result: [userD, userE, userF, userJ],
            },
        ]) {
            const sortedUsers = Utils.sortUsersByStatusAndDisplayName(data.users, statusesByUserId);
            for (let i = 0; i < sortedUsers.length; i++) {
                expect(sortedUsers[i]).toEqual(data.result[i]);
            }
        }
    });

    test('Users sort by status and displayname, TeammateNameDisplay set to nickname_full_name', function() {
        store.dispatch({
            type: GeneralTypes.CLIENT_CONFIG_RECEIVED,
            data: {
                TeammateNameDisplay: 'nickname_full_name',
            },
        });

        for (const data of [
            {
                users: [userF, userA, userB, userC, userD, userE],
                result: [userF, userE, userD, userB, userA, userC],
            },
            {
                users: [userJ, userI, userH, userG, userF, userE],
                result: [userJ, userF, userE, userH, userG, userI],
            },
            {
                users: [userJ, userF, userE, userD],
                result: [userJ, userF, userE, userD],
            },
        ]) {
            const sortedUsers = Utils.sortUsersByStatusAndDisplayName(data.users, statusesByUserId);
            for (let i = 0; i < sortedUsers.length; i++) {
                expect(sortedUsers[i]).toEqual(data.result[i]);
            }
        }
    });

    test('Users sort by status and displayname, TeammateNameDisplay set to full_name', function() {
        store.dispatch({
            type: GeneralTypes.CLIENT_CONFIG_RECEIVED,
            data: {
                TeammateNameDisplay: 'full_name',
            },
        });

        for (const data of [
            {
                users: [userF, userA, userB, userC, userD, userE],
                result: [userD, userF, userE, userB, userA, userC],
            },
            {
                users: [userJ, userI, userH, userG, userF, userE],
                result: [userF, userE, userJ, userH, userG, userI],
            },
            {
                users: [userJ, userF, userE, userD],
                result: [userD, userF, userE, userJ],
            },
        ]) {
            const sortedUsers = Utils.sortUsersByStatusAndDisplayName(data.users, statusesByUserId);
            for (let i = 0; i < sortedUsers.length; i++) {
                expect(sortedUsers[i]).toEqual(data.result[i]);
            }
        }
    });
});

describe('Utils.isValidPassword', function() {
    test('Minimum length enforced', function() {
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

    test('Require lowercase enforced', function() {
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

    test('Require uppercase enforced', function() {
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

    test('Require number enforced', function() {
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

    test('Require symbol enforced', function() {
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

describe('Utils.isKeyPressed', function() {
    test('Key match is used over keyCode if it exists', function() {
        for (const data of [
            {
                event: new KeyboardEvent('keydown', {key: '/', keyCode: 55, code: 'Slash'}),
                key: ['/', 191, 'Slash'],
                valid: true,
            },
            {
                event: new KeyboardEvent('keydown', {key: 'ù', keyCode: 191, code: 'KeyK'}),
                key: ['/', 191, 'Slash'],
                valid: false,
            },
        ]) {
            expect(Utils.isKeyPressed(data.event, data.key)).toEqual(data.valid);
        }
    });

    test('Key match works for both uppercase and lower case', function() {
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

    test('KeyCode is used for dead letter keys', function() {
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

    test('KeyCode is used for unidentified keys', function() {
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

    test('KeyCode is used for undefined keys', function() {
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

    test('code is used for determining if it exists', function() {
        for (const data of [
            {
                event: {key: 'a', code: 'KeyA'},
                key: ['', 2221, 'KeyA'],
                valid: true,
            },
            {
                event: {key: 'differentLanguage', code: 'KeyA'},
                key: [null, 2222, 'KeyA'],
                valid: true,
            },
        ]) {
            expect(Utils.isKeyPressed(data.event, data.key)).toEqual(data.valid);
        }
    });

    test('key should be tested as fallback for different layout of english keyboards', function() {
        //key will be k for keyboards like dvorak but code will be keyV as `v` is pressed
        const event = {key: 'k', code: 'KeyV'};
        const key = ['k', 2221, 'KeyK'];
        expect(Utils.isKeyPressed(event, key)).toEqual(true);
    });
});
