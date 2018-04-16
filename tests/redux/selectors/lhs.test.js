// Copyright (c) 2017 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import assert from 'assert';

import * as Selectors from 'selectors/lhs';

describe('Selectors.makeGetPostsEmbedVisibleObj', () => {
    let state;

    beforeEach(() => {
        state = {};
    });

    describe('should return the open state of the sidebar menu', () => {
        [true, false].forEach((expected) => {
            it(`when open is ${expected}`, () => {
                state = {views: {lhs: {
                    isOpen: expected,
                }}};

                assert.deepEqual(expected, Selectors.getIsLhsOpen(state));
            });
        });
    });
});
