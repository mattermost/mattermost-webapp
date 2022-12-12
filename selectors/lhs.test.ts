// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import {getIsLhsOpen, getVisibleLhsStaticItems} from 'selectors/lhs';
import {GlobalState} from 'types/store';

import * as DraftSelectors from './drafts';

describe('Selectors.Lhs', () => {
    let state: unknown;

    beforeEach(() => {
        state = {};
    });

    describe('should return the open state of the sidebar menu', () => {
        [true, false].forEach((expected) => {
            it(`when open is ${expected}`, () => {
                state = {
                    views: {
                        lhs: {
                            isOpen: expected,
                        },
                    },
                };

                assert.deepStrictEqual(expected, getIsLhsOpen(state as GlobalState));
            });
        });
    });

    describe('getVisibleLhsStaticItems', () => {
        beforeEach(() => {
            state = {
                views: {
                    lhs: {
                        isOpen: false,
                        currentStaticItemId: '',
                        staticItems: [
                            {
                                id: 'activity-and-insights',
                                isVisible: true,
                            },
                            {
                                id: 'threads',
                                isVisible: true,
                            },
                            {
                                id: 'drafts',
                                isVisible: false,
                            },
                        ],
                    },
                },
            };
        });

        it('should not return drafts when empty', () => {
            jest.spyOn(DraftSelectors, 'makeGetDraftsCount').mockImplementation(() => () => 0);
            const items = getVisibleLhsStaticItems(state as GlobalState);
            expect(items).toEqual([
                {
                    id: 'activity-and-insights',
                    isVisible: true,
                },
                {
                    id: 'threads',
                    isVisible: true,
                },
            ]);
        });

        it('should return drafts when there are available', () => {
            jest.spyOn(DraftSelectors, 'makeGetDraftsCount').mockImplementation(() => () => 1);
            const items = getVisibleLhsStaticItems(state as GlobalState);
            expect(items).toEqual([
                {
                    id: 'activity-and-insights',
                    isVisible: true,
                },
                {
                    id: 'threads',
                    isVisible: true,
                },
                {
                    id: 'drafts',
                    isVisible: true,
                },
            ]);
        });
    });
});
