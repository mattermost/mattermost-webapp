// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import {isEmail} from 'mattermost-redux/utils/helpers';

describe('Utils.isEmail', () => {
    it('', () => {
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
                email: '<testing> test.email@example.com',
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
            assert.equal(isEmail(data.email), data.valid);
        }
    });
});
