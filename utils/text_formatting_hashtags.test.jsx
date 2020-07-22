// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import * as TextFormatting from 'utils/text_formatting';

describe('TextFormatting.Hashtags with default setting', () => {
    it('Not hashtags', (done) => {
        assert.equal(
            TextFormatting.formatText('# hashtag').trim(),
            '<h1 class="markdown__heading">hashtag</h1>',
        );

        assert.equal(
            TextFormatting.formatText('#ab').trim(),
            '<p>#ab</p>',
        );

        assert.equal(
            TextFormatting.formatText('#123test').trim(),
            '<p>#123test</p>',
        );

        done();
    });

    it('Hashtags', (done) => {
        assert.equal(
            TextFormatting.formatText('#test').trim(),
            "<p><a class='mention-link' href='#' data-hashtag='#test'>#test</a></p>",
        );

        assert.equal(
            TextFormatting.formatText('#test123').trim(),
            "<p><a class='mention-link' href='#' data-hashtag='#test123'>#test123</a></p>",
        );

        assert.equal(
            TextFormatting.formatText('#test-test').trim(),
            "<p><a class='mention-link' href='#' data-hashtag='#test-test'>#test-test</a></p>",
        );

        assert.equal(
            TextFormatting.formatText('#test_test').trim(),
            "<p><a class='mention-link' href='#' data-hashtag='#test_test'>#test_test</a></p>",
        );

        assert.equal(
            TextFormatting.formatText('#test.test').trim(),
            "<p><a class='mention-link' href='#' data-hashtag='#test.test'>#test.test</a></p>",
        );

        assert.equal(
            TextFormatting.formatText('#test1/#test2').trim(),
            "<p><a class='mention-link' href='#' data-hashtag='#test1'>#test1</a>/<a class='mention-link' href='#' data-hashtag='#test2'>#test2</a></p>",
        );

        assert.equal(
            TextFormatting.formatText('(#test)').trim(),
            "<p>(<a class='mention-link' href='#' data-hashtag='#test'>#test</a>)</p>",
        );

        assert.equal(
            TextFormatting.formatText('#test-').trim(),
            "<p><a class='mention-link' href='#' data-hashtag='#test'>#test</a>-</p>",
        );

        assert.equal(
            TextFormatting.formatText('#test.').trim(),
            "<p><a class='mention-link' href='#' data-hashtag='#test'>#test</a>.</p>",
        );

        assert.equal(
            TextFormatting.formatText('This is a sentence #test containing a hashtag').trim(),
            "<p>This is a sentence <a class='mention-link' href='#' data-hashtag='#test'>#test</a> containing a hashtag</p>",
        );

        done();
    });

    it('Formatted hashtags', (done) => {
        assert.equal(
            TextFormatting.formatText('*#test*').trim(),
            "<p><em><a class='mention-link' href='#' data-hashtag='#test'>#test</a></em></p>",
        );

        assert.equal(
            TextFormatting.formatText('_#test_').trim(),
            "<p><em><a class='mention-link' href='#' data-hashtag='#test'>#test</a></em></p>",
        );

        assert.equal(
            TextFormatting.formatText('**#test**').trim(),
            "<p><strong><a class='mention-link' href='#' data-hashtag='#test'>#test</a></strong></p>",
        );

        assert.equal(
            TextFormatting.formatText('__#test__').trim(),
            "<p><strong><a class='mention-link' href='#' data-hashtag='#test'>#test</a></strong></p>",
        );

        assert.equal(
            TextFormatting.formatText('~~#test~~').trim(),
            "<p><del><a class='mention-link' href='#' data-hashtag='#test'>#test</a></del></p>",
        );

        assert.equal(
            TextFormatting.formatText('`#test`').trim(),
            '<p>' +
                '<span class="codespan__pre-wrap">' +
                    '<code>' +
                        '#test' +
                    '</code>' +
                '</span>' +
            '</p>',
        );

        assert.equal(
            TextFormatting.formatText('[this is a link #test](example.com)').trim(),
            '<p><a class="theme markdown__link" href="http://example.com" rel="noreferrer" target="_blank">this is a link #test</a></p>',
        );

        done();
    });

    it('Searching for hashtags', (done) => {
        assert.equal(
            TextFormatting.formatText('#test', {searchTerm: 'test'}).trim(),
            '<p><span class="search-highlight"><a class=\'mention-link\' href=\'#\' data-hashtag=\'#test\'>#test</a></span></p>',
        );

        assert.equal(
            TextFormatting.formatText('#test', {searchTerm: '#test'}).trim(),
            '<p><span class="search-highlight"><a class=\'mention-link\' href=\'#\' data-hashtag=\'#test\'>#test</a></span></p>',
        );

        assert.equal(
            TextFormatting.formatText('#foo/#bar', {searchTerm: '#foo'}).trim(),
            '<p><span class="search-highlight"><a class=\'mention-link\' href=\'#\' data-hashtag=\'#foo\'>#foo</a></span>/<a class=\'mention-link\' href=\'#\' data-hashtag=\'#bar\'>#bar</a></p>',
        );

        assert.equal(
            TextFormatting.formatText('#foo/#bar', {searchTerm: 'bar'}).trim(),
            '<p><a class=\'mention-link\' href=\'#\' data-hashtag=\'#foo\'>#foo</a>/<span class="search-highlight"><a class=\'mention-link\' href=\'#\' data-hashtag=\'#bar\'>#bar</a></span></p>',
        );

        assert.equal(
            TextFormatting.formatText('not#test', {searchTerm: '#test'}).trim(),
            '<p>not#test</p>',
        );

        done();
    });

    it('Potential hashtags with other entities nested', (done) => {
        assert.equal(
            TextFormatting.formatText('#@test').trim(),
            '<p>#@test</p>',
        );

        let options = {
            atMentions: true,
        };
        assert.equal(
            TextFormatting.formatText('#@test', options).trim(),
            '<p>#<span data-mention="test">@test</span></p>',
        );

        assert.equal(
            TextFormatting.formatText('#~test').trim(),
            '<p>#~test</p>',
        );

        options = {
            channelNamesMap: {
                test: {id: '1234', name: 'test', display_name: 'Test Channel'},
            },
            team: {id: 'abcd', name: 'abcd', display_name: 'Alphabet'},
        };
        assert.equal(
            TextFormatting.formatText('#~test', options).trim(),
            '<p>#<a class="mention-link" href="/abcd/channels/test" data-channel-mention="test">~Test Channel</a></p>',
        );

        assert.equal(
            TextFormatting.formatText('#:mattermost:').trim(),
            '<p>#<span data-emoticon="mattermost">:mattermost:</span></p>',
        );

        assert.equal(
            TextFormatting.formatText('#test@example.com').trim(),
            "<p><a class='mention-link' href='#' data-hashtag='#test@example.com'>#test@example.com</a></p>",
        );

        done();
    });
});

describe('TextFormatting.Hashtags with various settings', () => {
    it('Boundary of MinimumHashtagLength', (done) => {
        assert.equal(
            TextFormatting.formatText('#疑問', {minimumHashtagLength: 2}).trim(),
            "<p><a class='mention-link' href='#' data-hashtag='#疑問'>#疑問</a></p>",
        );
        assert.equal(
            TextFormatting.formatText('This is a sentence #疑問 containing a hashtag', {minimumHashtagLength: 2}).trim(),
            "<p>This is a sentence <a class='mention-link' href='#' data-hashtag='#疑問'>#疑問</a> containing a hashtag</p>",
        );

        assert.equal(
            TextFormatting.formatText('#疑', {minimumHashtagLength: 2}).trim(),
            '<p>#疑</p>',
        );
        assert.equal(
            TextFormatting.formatText('This is a sentence #疑 containing a hashtag', {minimumHashtagLength: 2}).trim(),
            '<p>This is a sentence #疑 containing a hashtag</p>',
        );

        done();
    });
});
