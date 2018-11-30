// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import * as TextFormatting from 'utils/text_formatting.jsx';

describe('TextFormatting.ChannelLinks', () => {
    it('Not channel links', (done) => {
        assert.equal(
            TextFormatting.formatText('~123').trim(),
            '<p>~123</p>'
        );

        assert.equal(
            TextFormatting.formatText('~town-square').trim(),
            '<p>~town-square</p>'
        );

        done();
    });

    describe('Channel links', () => {
        afterEach(() => {
            delete window.basename;
        });

        it('should link ~town-square', () => {
            assert.equal(
                TextFormatting.formatText('~town-square', {
                    channelNamesMap: {'town-square': {display_name: 'Town Square'}},
                    team: {name: 'myteam'},
                }).trim(),
                '<p><a class="mention-link" href="/myteam/channels/town-square" data-channel-mention="town-square">~Town Square</a></p>'
            );
        });

        it('should link ~town-square followed by a period', () => {
            assert.equal(
                TextFormatting.formatText('~town-square.', {
                    channelNamesMap: {'town-square': {display_name: 'Town Square'}},
                    team: {name: 'myteam'},
                }).trim(),
                '<p><a class="mention-link" href="/myteam/channels/town-square" data-channel-mention="town-square">~Town Square</a>.</p>'
            );
        });

        it('should link ~town-square, with display_name an HTML string', () => {
            assert.equal(
                TextFormatting.formatText('~town-square', {
                    channelNamesMap: {'town-square': {display_name: '<b>Reception</b>'}},
                    team: {name: 'myteam'},
                }).trim(),
                '<p><a class="mention-link" href="/myteam/channels/town-square" data-channel-mention="town-square">~&lt;b&gt;Reception&lt;/b&gt;</a></p>'
            );
        });

        it('should link ~town-square, with a basename defined', () => {
            window.basename = '/subpath';
            assert.equal(
                TextFormatting.formatText('~town-square', {
                    channelNamesMap: {'town-square': {display_name: '<b>Reception</b>'}},
                    team: {name: 'myteam'},
                }).trim(),
                '<p><a class="mention-link" href="/subpath/myteam/channels/town-square" data-channel-mention="town-square">~&lt;b&gt;Reception&lt;/b&gt;</a></p>'
            );
        });
    });
});
