// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as TextFormatting from 'utils/text_formatting';

describe('TextFormatting.ChannelLinks', () => {
    test('Not channel links', () => {
        expect(
            TextFormatting.formatText('~123').trim(),
        ).toBe(
            '<p>~123</p>',
        );

        expect(
            TextFormatting.formatText('~town-square').trim(),
        ).toBe(
            '<p>~town-square</p>',
        );
    });

    describe('Channel links', () => {
        afterEach(() => {
            delete window.basename;
        });

        test('should link ~town-square', () => {
            expect(
                TextFormatting.formatText('~town-square', {
                    channelNamesMap: {'town-square': {display_name: 'Town Square'}},
                    team: {name: 'myteam'},
                }).trim(),
            ).toBe(
                '<p><a class="mention-link" href="/myteam/channels/town-square" data-channel-mention="town-square">~Town Square</a></p>',
            );
        });

        test('should link ~town-square followed by a period', () => {
            expect(
                TextFormatting.formatText('~town-square.', {
                    channelNamesMap: {'town-square': {display_name: 'Town Square'}},
                    team: {name: 'myteam'},
                }).trim(),
            ).toBe(
                '<p><a class="mention-link" href="/myteam/channels/town-square" data-channel-mention="town-square">~Town Square</a>.</p>',
            );
        });

        test('should link ~town-square, with display_name an HTML string', () => {
            expect(
                TextFormatting.formatText('~town-square', {
                    channelNamesMap: {'town-square': {display_name: '<b>Reception</b>'}},
                    team: {name: 'myteam'},
                }).trim(),
            ).toBe(
                '<p><a class="mention-link" href="/myteam/channels/town-square" data-channel-mention="town-square">~&lt;b&gt;Reception&lt;/b&gt;</a></p>',
            );
        });

        test('should link ~town-square, with a basename defined', () => {
            window.basename = '/subpath';
            expect(
                TextFormatting.formatText('~town-square', {
                    channelNamesMap: {'town-square': {display_name: '<b>Reception</b>'}},
                    team: {name: 'myteam'},
                }).trim(),
            ).toBe(
                '<p><a class="mention-link" href="/subpath/myteam/channels/town-square" data-channel-mention="town-square">~&lt;b&gt;Reception&lt;/b&gt;</a></p>',
            );
        });

        test('should link in brackets', () => {
            expect(
                TextFormatting.formatText('(~town-square)', {
                    channelNamesMap: {'town-square': {display_name: 'Town Square'}},
                    team: {name: 'myteam'},
                }).trim(),
            ).toBe(
                '<p>(<a class="mention-link" href="/myteam/channels/town-square" data-channel-mention="town-square">~Town Square</a>)</p>',
            );
        });
    });

    describe('invalid channel links', () => {
        test('should not link when a ~ is in the middle of a word', () => {
            expect(
                TextFormatting.formatText('aa~town-square', {
                    channelNamesMap: {'town-square': {display_name: 'Town Square'}},
                    team: {name: 'myteam'},
                }).trim(),
            ).toBe(
                '<p>aa~town-square</p>',
            );
        });
    });
});
