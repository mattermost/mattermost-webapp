// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.
//
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
    test('Password min/max length enforced if no EE password requirements set', function() {
        for (const data of [
            {
                password: 'four',
                config: { // not EE, so password just has to be min < length < max
                    isEnterprise: false,
                    isLicensed: true,
                    isPasswordRequirements: true,
                },
                valid: false,
            },
            {
                password: 'thistestpasswordismorethansixtyfourcharacterslongsoitstoolongtobeapassword',
                config: { // not EE, so password just has to be min < length < max
                    isEnterprise: false,
                    isLicensed: true,
                    isPasswordRequirements: true,
                },
                valid: false,
            },
            {
                password: 'thisisavalidpassword',
                config: { // not EE, so password just has to be min < length < max
                    isEnterprise: false,
                    isLicensed: true,
                    isPasswordRequirements: true,
                },
                valid: true,
            },
            {
                password: 'four',
                config: { // not licensed, so password just has to be min < length < max
                    isEnterprise: true,
                    isLicensed: false,
                    isPasswordRequirements: true,
                },
                valid: false,
            },
            {
                password: 'thistestpasswordismorethansixtyfourcharacterslongsoitstoolongtobeapassword',
                config: { // not licensed, so password just has to be min < length < max
                    isEnterprise: true,
                    isLicensed: false,
                    isPasswordRequirements: true,
                },
                valid: false,
            },
            {
                password: 'thisisavalidpassword',
                config: { // not licensed, so password just has to be min < length < max
                    isEnterprise: true,
                    isLicensed: false,
                    isPasswordRequirements: true,
                },
                valid: true,
            },
            {
                password: 'four',
                config: { // no password requirements, so password just has to be min < length < max
                    isEnterprise: true,
                    isLicensed: true,
                    isPasswordRequirements: false,
                },
                valid: false,
            },
            {
                password: 'thistestpasswordismorethansixtyfourcharacterslongsoitstoolongtobeapassword',
                config: { // no password requirements, so password just has to be min < length < max
                    isEnterprise: true,
                    isLicensed: true,
                    isPasswordRequirements: false,
                },
                valid: false,
            },
            {
                password: 'thisisavalidpassword',
                config: { // no password requirements, so password just has to be min < length < max
                    isEnterprise: true,
                    isLicensed: true,
                    isPasswordRequirements: false,
                },
                valid: true,
            },
        ]) {
            const errorMsg = Utils.isValidPassword(data.password, data.config);
            if (data.valid) {
                expect(errorMsg).toEqual('');
            } else {
                expect(errorMsg).not.toEqual('');
            }
        }
    });

    test('Minimum length enforced', function() {
        for (const data of [
            {
                password: 'tooshort',
                config: {
                    isEnterprise: true,
                    isLicensed: true,
                    isPasswordRequirements: true,
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
                    isEnterprise: true,
                    isLicensed: true,
                    isPasswordRequirements: true,
                    minimumLength: 10,
                    requireLowercase: false,
                    requireUppercase: false,
                    requireNumber: false,
                    requireSymbol: false,
                },
                valid: true,
            },
        ]) {
            const errorMsg = Utils.isValidPassword(data.password, data.config);
            if (data.valid) {
                expect(errorMsg).toEqual('');
            } else {
                expect(errorMsg).not.toEqual('');
            }
        }
    });

    test('Require lowercase enforced', function() {
        for (const data of [
            {
                password: 'UPPERCASE',
                config: {
                    isEnterprise: true,
                    isLicensed: true,
                    isPasswordRequirements: true,
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
                    isEnterprise: true,
                    isLicensed: true,
                    isPasswordRequirements: true,
                    minimumLength: 5,
                    requireLowercase: true,
                    requireUppercase: false,
                    requireNumber: false,
                    requireSymbol: false,
                },
                valid: true,
            },
        ]) {
            const errorMsg = Utils.isValidPassword(data.password, data.config);
            if (data.valid) {
                expect(errorMsg).toEqual('');
            } else {
                expect(errorMsg).not.toEqual('');
            }
        }
    });

    test('Require uppercase enforced', function() {
        for (const data of [
            {
                password: 'lowercase',
                config: {
                    isEnterprise: true,
                    isLicensed: true,
                    isPasswordRequirements: true,
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
                    isEnterprise: true,
                    isLicensed: true,
                    isPasswordRequirements: true,
                    minimumLength: 5,
                    requireLowercase: false,
                    requireUppercase: true,
                    requireNumber: false,
                    requireSymbol: false,
                },
                valid: true,
            },
        ]) {
            const errorMsg = Utils.isValidPassword(data.password, data.config);
            if (data.valid) {
                expect(errorMsg).toEqual('');
            } else {
                expect(errorMsg).not.toEqual('');
            }
        }
    });

    test('Require number enforced', function() {
        for (const data of [
            {
                password: 'NoNumbers',
                config: {
                    isEnterprise: true,
                    isLicensed: true,
                    isPasswordRequirements: true,
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
                    isEnterprise: true,
                    isLicensed: true,
                    isPasswordRequirements: true,
                    minimumLength: 5,
                    requireLowercase: true,
                    requireUppercase: true,
                    requireNumber: true,
                    requireSymbol: false,
                },
                valid: true,
            },
        ]) {
            const errorMsg = Utils.isValidPassword(data.password, data.config);
            if (data.valid) {
                expect(errorMsg).toEqual('');
            } else {
                expect(errorMsg).not.toEqual('');
            }
        }
    });

    test('Require symbol enforced', function() {
        for (const data of [
            {
                password: 'N0Symb0ls',
                config: {
                    isEnterprise: true,
                    isLicensed: true,
                    isPasswordRequirements: true,
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
                    isEnterprise: true,
                    isLicensed: true,
                    isPasswordRequirements: true,
                    minimumLength: 5,
                    requireLowercase: true,
                    requireUppercase: true,
                    requireNumber: true,
                    requireSymbol: true,
                },
                valid: true,
            },
        ]) {
            const errorMsg = Utils.isValidPassword(data.password, data.config);
            if (data.valid) {
                expect(errorMsg).toEqual('');
            } else {
                expect(errorMsg).not.toEqual('');
            }
        }
    });
});

describe('Utils.isEmail', function() {
    test('', function() {
        for (const data of [
            {
                email: 'prettyandsimple@example.com',
                valid: true,
            },
            {
                email: 'very.common@example.com',
                valid: true,
            },
            {
                email: 'disposable.style.email.with+symbol@example.com',
                valid: true,
            },
            {
                email: 'other.email-with-dash@example.com',
                valid: true,
            },
            {
                email: 'fully-qualified-domain@example.com',
                valid: true,
            },
            {
                email: 'user.name+tag+sorting@example.com',
                valid: true,
            },
            {
                email: 'x@example.com',
                valid: true,
            },
            {
                email: 'example-indeed@strange-example.com',
                valid: true,
            },
            {
                email: 'admin@mailserver1',
                valid: true,
            },
            {
                email: '#!$%&\'*+-/=?^_`{}|~@example.org',
                valid: true,
            },
            {
                email: 'example@s.solutions',
                valid: true,
            },
            {
                email: 'Abc.example.com',
                valid: false,
            },
            {
                email: 'A@b@c@example.com',
                valid: false,
            },
            {
                email: '<Jonathan Fritz> jonathan.fritz@mattermost.com',
                valid: false,
            },
            {
                email: 'test <test@address.do>',
                valid: false,
            },
            {
                email: 'comma@domain.com, separated@domain.com',
                valid: false,
            },
            {
                email: 'comma@domain.com,separated@domain.com',
                valid: false,
            },
        ]) {
            expect(Utils.isEmail(data.email)).toEqual(data.valid);
        }
    });
});

describe('Utils.isKeyPressed', function() {
    test('Key match is used over keyCode if it exists', function() {
        for (const data of [
            {
                event: new KeyboardEvent('keydown', {key: '/', keyCode: 55}),
                key: ['/', 191],
                valid: true,
            },
            {
                event: new KeyboardEvent('keydown', {key: 'ù', keyCode: 191}),
                key: ['/', 191],
                valid: false,
            },
        ]) {
            expect(Utils.isKeyPressed(data.event, data.key)).toEqual(data.valid);
        }
    });

    test('Key match works for uppercase letters, but it does not ignore case', function() {
        for (const data of [
            {
                event: new KeyboardEvent('keydown', {key: 'A', keyCode: 65}),
                key: ['a', 65],
                valid: true,
            },
            {
                event: new KeyboardEvent('keydown', {key: 'a', keyCode: 65}),
                key: ['A', 65],
                valid: false,
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
                event: new KeyboardEvent('keydown', {key: 'Unidentified', keyCode: 2220}),
                key: ['', 2220],
                valid: true,
            },
            {
                event: new KeyboardEvent('keydown', {key: 'Unidentified', keyCode: 2220}),
                key: ['not-used-field', 2220],
                valid: true,
            },
            {
                event: new KeyboardEvent('keydown', {key: 'Unidentified', keyCode: 2220}),
                key: [null, 2220],
                valid: true,
            },
            {
                event: new KeyboardEvent('keydown', {key: 'Unidentified', keyCode: 2220}),
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
});
