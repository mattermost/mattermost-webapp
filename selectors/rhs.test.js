// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import * as Selectors from 'selectors/rhs.jsx';

describe('Selectors.Rhs', () => {
    describe('should return the last time a post was selected', () => {
        [0, 1000000, 2000000].forEach((expected) => {
            it(`when open is ${expected}`, () => {
                const state = {views: {rhs: {
                    selectedPostFocussedAt: expected,
                }}};

                assert.deepEqual(expected, Selectors.getSelectedPostFocussedAt(state));
            });
        });
    });

    describe('should return the open state of the sidebar', () => {
        [true, false].forEach((expected) => {
            it(`when open is ${expected}`, () => {
                const state = {views: {rhs: {
                    isSidebarOpen: expected,
                }}};

                assert.deepEqual(expected, Selectors.getIsRhsOpen(state));
            });
        });
    });

    describe('should return the open state of the sidebar menu', () => {
        [true, false].forEach((expected) => {
            it(`when open is ${expected}`, () => {
                const state = {views: {rhs: {
                    isMenuOpen: expected,
                }}};

                assert.deepEqual(expected, Selectors.getIsRhsMenuOpen(state));
            });
        });
    });
});
