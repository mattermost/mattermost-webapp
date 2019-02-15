// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import * as Emoticons from 'utils/emoticons.jsx';

describe('Emoticons', () => {
    describe('handleEmoticons', () => {
        test('should replace emoticons with tokens', () => {
            expect(Emoticons.handleEmoticons(':goat: :dash:', new Map())).
                toEqual('$MM_EMOTICON0$ $MM_EMOTICON1$');
        });

        test('should replace emoticons not separated by whitespace', () => {
            expect(Emoticons.handleEmoticons(':goat::dash:', new Map())).
                toEqual('$MM_EMOTICON0$$MM_EMOTICON1$');
        });

        test('should replace emoticons separated by punctuation', () => {
            expect(Emoticons.handleEmoticons('/:goat:..:dash:)', new Map())).
                toEqual('/$MM_EMOTICON0$..$MM_EMOTICON1$)');
        });

        test('should replace emoticons separated by text', () => {
            expect(Emoticons.handleEmoticons('asdf:goat:asdf:dash:asdf', new Map())).
                toEqual('asdf$MM_EMOTICON0$asdf$MM_EMOTICON1$asdf');
        });

        test('shouldn\'t replace invalid emoticons', () => {
            expect(Emoticons.handleEmoticons(':goat : : dash:', new Map())).
                toEqual(':goat : : dash:');
        });

        test('should allow comma immediately following emoticon 1', () => {
            expect(Emoticons.handleEmoticons(':),', new Map())).
                toEqual('$MM_EMOTICON0$,');
        });

        test('should allow comma immediately following emoticon 2', () => {
            expect(Emoticons.handleEmoticons(':P,', new Map())).
                toEqual('$MM_EMOTICON0$,');
        });

        test('should allow punctuation immediately following emoticon 1', () => {
            expect(Emoticons.handleEmoticons(':)!', new Map())).
                toEqual('$MM_EMOTICON0$!');
        });

        test('should allow punctuation immediately following emoticon 2', () => {
            expect(Emoticons.handleEmoticons(':P!', new Map())).
                toEqual('$MM_EMOTICON0$!');
        });

        test('should allow punctuation immediately before and following emoticon 1', () => {
            expect(Emoticons.handleEmoticons('":)"', new Map())).
                toEqual('"$MM_EMOTICON0$"');
        });

        test('should allow punctuation immediately before and following emoticon 2', () => {
            expect(Emoticons.handleEmoticons('":P"', new Map())).
                toEqual('"$MM_EMOTICON0$"');
        });
    });
});
