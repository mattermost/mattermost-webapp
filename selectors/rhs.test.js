// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import * as Selectors from 'selectors/rhs';

describe('Selectors.Rhs', () => {
    describe('should return the last time a post was selected', () => {
        [0, 1000000, 2000000].forEach((expected) => {
            it(`when open is ${expected}`, () => {
                const state = {views: {rhs: {
                    selectedPostFocussedAt: expected,
                }}};

                assert.strictEqual(expected, Selectors.getSelectedPostFocussedAt(state));
            });
        });
    });

    describe('should return the open state of the sidebar', () => {
        [true, false].forEach((expected) => {
            it(`when open is ${expected}`, () => {
                const state = {views: {rhs: {
                    isSidebarOpen: expected,
                }}};

                assert.strictEqual(expected, Selectors.getIsRhsOpen(state));
            });
        });
    });

    describe('should return the open state of the sidebar menu', () => {
        [true, false].forEach((expected) => {
            it(`when open is ${expected}`, () => {
                const state = {views: {rhs: {
                    isMenuOpen: expected,
                }}};

                assert.strictEqual(expected, Selectors.getIsRhsMenuOpen(state));
            });
        });
    });

    describe('should return the highlighted reply\'s id', () => {
        test.each(['42', ''])('when id is %s', (expected) => {
            const state = {views: {rhs: {
                highlightedPostId: expected,
            }}};

            assert.strictEqual(expected, Selectors.getHighlightedPostId(state));
        });
    });

    describe('should return the previousRhsState', () => {
        test.each([
            [[], null],
            [['channel-info'], 'channel-info'],
            [['channel-info', 'pinned'], 'pinned'],
        ])('%p gives %p', (previousArray, previous) => {
            const state = {
                views: {rhs: {
                    previousRhsStates: previousArray,
                }}};
            assert.strictEqual(previous, Selectors.getPreviousRhsState(state));
        });
    });
});
