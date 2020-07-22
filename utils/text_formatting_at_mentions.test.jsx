// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import * as TextFormatting from 'utils/text_formatting';

describe('TextFormatting.AtMentions', () => {
    it('At mentions', () => {
        assert.equal(
            TextFormatting.autolinkAtMentions('@user', new Map()),
            '$MM_ATMENTION0$',
            'should replace mention with token',
        );

        assert.equal(
            TextFormatting.autolinkAtMentions('abc"@user"def', new Map()),
            'abc"$MM_ATMENTION0$"def',
            'should replace mention surrounded by punctuation with token',
        );

        assert.equal(
            TextFormatting.autolinkAtMentions('@user1 @user2', new Map()),
            '$MM_ATMENTION0$ $MM_ATMENTION1$',
            'should replace multiple mentions with tokens',
        );

        assert.equal(
            TextFormatting.autolinkAtMentions('@user1/@user2/@user3', new Map()),
            '$MM_ATMENTION0$/$MM_ATMENTION1$/$MM_ATMENTION2$',
            'should replace multiple mentions with tokens',
        );

        assert.equal(
            TextFormatting.autolinkAtMentions('@us_-e.r', new Map()),
            '$MM_ATMENTION0$',
            'should replace multiple mentions containing punctuation with token',
        );

        assert.equal(
            TextFormatting.autolinkAtMentions('@user.', new Map()),
            '$MM_ATMENTION0$',
            'should capture trailing punctuation as part of mention',
        );
        assert.equal(
            TextFormatting.autolinkAtMentions('@foo.com @bar.com', new Map()),
            '$MM_ATMENTION0$ $MM_ATMENTION1$',
            'should capture two at mentions with space in between',
        );
        assert.equal(
            TextFormatting.autolinkAtMentions('@foo.com@bar.com', new Map()),
            '$MM_ATMENTION0$$MM_ATMENTION1$',
            'should capture two at mentions without space in between',
        );
        assert.equal(
            TextFormatting.autolinkAtMentions('@foo.com@bar.com@baz.com', new Map()),
            '$MM_ATMENTION0$$MM_ATMENTION1$$MM_ATMENTION2$',
            'should capture multiple at mentions without space in between',
        );
    });

    it('Not at mentions', () => {
        assert.equal(
            TextFormatting.autolinkAtMentions('user@host', new Map()),
            'user@host',
        );

        assert.equal(
            TextFormatting.autolinkAtMentions('user@email.com', new Map()),
            'user@email.com',
        );

        assert.equal(
            TextFormatting.autolinkAtMentions('@', new Map()),
            '@',
        );

        assert.equal(
            TextFormatting.autolinkAtMentions('@ ', new Map()),
            '@ ',
        );

        assert.equal(
            TextFormatting.autolinkAtMentions(':@', new Map()),
            ':@',
        );
    });

    it('Highlighted at mentions', () => {
        assert.equal(
            TextFormatting.formatText('@user', {atMentions: true, mentionKeys: [{key: '@user'}]}).trim(),
            '<p><span class="mention--highlight"><span data-mention="user">@user</span></span></p>',
        );
        assert.equal(
            TextFormatting.formatText('@channel', {atMentions: true, mentionKeys: [{key: '@channel'}]}).trim(),
            '<p><span class="mention--highlight"><span data-mention="channel">@channel</span></span></p>',
        );
        assert.equal(
            TextFormatting.formatText('@all', {atMentions: true, mentionKeys: [{key: '@all'}]}).trim(),
            '<p><span class="mention--highlight"><span data-mention="all">@all</span></span></p>',
        );

        assert.equal(
            TextFormatting.formatText('@USER', {atMentions: true, mentionKeys: [{key: '@user'}]}).trim(),
            '<p><span class="mention--highlight"><span data-mention="USER">@USER</span></span></p>',
        );
        assert.equal(
            TextFormatting.formatText('@CHanNEL', {atMentions: true, mentionKeys: [{key: '@channel'}]}).trim(),
            '<p><span class="mention--highlight"><span data-mention="CHanNEL">@CHanNEL</span></span></p>',
        );
        assert.equal(
            TextFormatting.formatText('@ALL', {atMentions: true, mentionKeys: [{key: '@all'}]}).trim(),
            '<p><span class="mention--highlight"><span data-mention="ALL">@ALL</span></span></p>',
        );
        assert.equal(
            TextFormatting.formatText('@foo.com', {atMentions: true, mentionKeys: [{key: '@foo.com'}]}).trim(),
            '<p><span class="mention--highlight"><span data-mention="foo.com">@foo.com</span></span></p>',
        );
        assert.equal(
            TextFormatting.formatText('@foo.com @bar.com', {atMentions: true, mentionKeys: [{key: '@foo.com'}, {key: '@bar.com'}]}).trim(),
            '<p><span class="mention--highlight"><span data-mention="foo.com">@foo.com</span></span> <span class="mention--highlight"><span data-mention="bar.com">@bar.com</span></span></p>',
        );
        assert.equal(
            TextFormatting.formatText('@foo.com@bar.com', {atMentions: true, mentionKeys: [{key: '@foo.com'}, {key: '@bar.com'}]}).trim(),
            '<p><span class="mention--highlight"><span data-mention="foo.com">@foo.com</span></span><span class="mention--highlight"><span data-mention="bar.com">@bar.com</span></span></p>',
        );
    });

    it('Mix highlight at mentions', () => {
        assert.equal(
            TextFormatting.formatText('@foo.com @bar.com', {atMentions: true, mentionKeys: [{key: '@foo.com'}]}).trim(),
            '<p><span class="mention--highlight"><span data-mention="foo.com">@foo.com</span></span> <span data-mention="bar.com">@bar.com</span></p>',
            'should highlight first at mention, with space in between',
        );
        assert.equal(
            TextFormatting.formatText('@foo.com @bar.com', {atMentions: true, mentionKeys: [{key: '@bar.com'}]}).trim(),
            '<p><span data-mention="foo.com">@foo.com</span> <span class="mention--highlight"><span data-mention="bar.com">@bar.com</span></span></p>',
            'should highlight second at mention, with space in between',
        );
        assert.equal(
            TextFormatting.formatText('@foo.com@bar.com', {atMentions: true, mentionKeys: [{key: '@foo.com'}]}).trim(),
            '<p><span class="mention--highlight"><span data-mention="foo.com">@foo.com</span></span><span data-mention="bar.com">@bar.com</span></p>',
            'should highlight first at mention, without space in between',
        );
        assert.equal(
            TextFormatting.formatText('@foo.com@bar.com', {atMentions: true, mentionKeys: [{key: '@bar.com'}]}).trim(),
            '<p><span data-mention="foo.com">@foo.com</span><span class="mention--highlight"><span data-mention="bar.com">@bar.com</span></span></p>',
            'should highlight second at mention, without space in between',
        );
        assert.equal(
            TextFormatting.formatText('@foo.com@bar.com', {atMentions: true, mentionKeys: [{key: '@user'}]}).trim(),
            '<p><span data-mention="foo.com">@foo.com</span><span data-mention="bar.com">@bar.com</span></p>',
            'should not highlight any at mention',
        );
    });
});
