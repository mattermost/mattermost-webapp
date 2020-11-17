// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import * as TextFormatting from 'utils/text_formatting';

describe('TextFormatting.Emails', () => {
    it('Valid email addresses', () => {
        assert.equal(
            TextFormatting.formatText('email@domain.com').trim(),
            '<p><a class="theme" href="mailto:email@domain.com" rel="noreferrer" target="_blank">email@domain.com</a></p>',
        );

        assert.equal(
            TextFormatting.formatText('firstname.lastname@domain.com').trim(),
            '<p><a class="theme" href="mailto:firstname.lastname@domain.com" rel="noreferrer" target="_blank">firstname.lastname@domain.com</a></p>',
        );

        assert.equal(
            TextFormatting.formatText('email@subdomain.domain.com').trim(),
            '<p><a class="theme" href="mailto:email@subdomain.domain.com" rel="noreferrer" target="_blank">email@subdomain.domain.com</a></p>',
        );

        assert.equal(
            TextFormatting.formatText('firstname+lastname@domain.com').trim(),
            '<p><a class="theme" href="mailto:firstname+lastname@domain.com" rel="noreferrer" target="_blank">firstname+lastname@domain.com</a></p>',
        );

        assert.equal(
            TextFormatting.formatText('1234567890@domain.com').trim(),
            '<p><a class="theme" href="mailto:1234567890@domain.com" rel="noreferrer" target="_blank">1234567890@domain.com</a></p>',
        );

        assert.equal(
            TextFormatting.formatText('email@domain-one.com').trim(),
            '<p><a class="theme" href="mailto:email@domain-one.com" rel="noreferrer" target="_blank">email@domain-one.com</a></p>',
        );

        assert.equal(
            TextFormatting.formatText('email@domain.name').trim(),
            '<p><a class="theme" href="mailto:email@domain.name" rel="noreferrer" target="_blank">email@domain.name</a></p>',
        );

        assert.equal(
            TextFormatting.formatText('email@domain.co.jp').trim(),
            '<p><a class="theme" href="mailto:email@domain.co.jp" rel="noreferrer" target="_blank">email@domain.co.jp</a></p>',
        );

        assert.equal(
            TextFormatting.formatText('firstname-lastname@domain.com').trim(),
            '<p><a class="theme" href="mailto:firstname-lastname@domain.com" rel="noreferrer" target="_blank">firstname-lastname@domain.com</a></p>',
        );
    });

    it('Should be valid, but matching GitHub', () => {
        assert.equal(
            TextFormatting.formatText('email@123.123.123.123').trim(),
            '<p>email@123.123.123.123</p>',
        );

        assert.equal(
            TextFormatting.formatText('email@[123.123.123.123]').trim(),
            '<p>email@[123.123.123.123]</p>',
        );

        assert.equal(
            TextFormatting.formatText('"email"@domain.com').trim(),
            '<p>&quot;email&quot;@domain.com</p>',
        );
    });

    it('Should be valid, but broken due to Markdown parsing happening before email autolinking', () => {
        assert.equal(
            TextFormatting.formatText('_______@domain.com').trim(),
            '<p><strong>___</strong>@domain.com</p>',
        );
    });

    it('Not valid emails', () => {
        assert.equal(
            TextFormatting.formatText('plainaddress').trim(),
            '<p>plainaddress</p>',
        );

        assert.equal(
            TextFormatting.formatText('#@%^%#$@#$@#.com').trim(),
            '<p>#@%^%#$@#$@#.com</p>',
        );

        assert.equal(
            TextFormatting.formatText('@domain.com').trim(),
            '<p>@domain.com</p>',
        );

        assert.equal(
            TextFormatting.formatText('Joe Smith <email@domain.com>').trim(),
            '<p>Joe Smith <a class="theme markdown__link" href="mailto:email@domain.com" rel="noreferrer" target="_blank">email@domain.com</a></p>',
        );

        assert.equal(
            TextFormatting.formatText('email.domain.com').trim(),
            '<p>email.domain.com</p>',
        );

        assert.equal(
            TextFormatting.formatText('email.@domain.com').trim(),
            '<p>email.@domain.com</p>',
        );
    });

    it('Should be invalid, but matching GitHub', () => {
        assert.equal(
            TextFormatting.formatText('email@domain@domain.com').trim(),
            '<p>email@<a class="theme" href="mailto:domain@domain.com" rel="noreferrer" target="_blank">domain@domain.com</a></p>',
        );
    });

    it('Should be invalid, but broken', () => {
        assert.equal(
            TextFormatting.formatText('email@domain@domain.com').trim(),
            '<p>email@<a class="theme" href="mailto:domain@domain.com" rel="noreferrer" target="_blank">domain@domain.com</a></p>',
        );
    });
});
