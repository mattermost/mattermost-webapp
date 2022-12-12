// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import {getIsLhsOpen, getVisibleLhsStaticItems} from 'selectors/lhs';
import {GlobalState} from 'types/store';

import * as DraftSelectors from './drafts';

describe('Selectors.Lhs', () => {
    let state: GlobalState;

    beforeEach(() => {
        state = {} as GlobalState;
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
                } as GlobalState;

                assert.deepStrictEqual(expected, getIsLhsOpen(state));
            });
        });
    });

    describe('getVisibleLhsStaticItems', () => {
        beforeEach(() => {
            state = {
                views: {
                    lhs: {
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
            const items = getVisibleLhsStaticItems(state);
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
            const items = getVisibleLhsStaticItems(state);
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
