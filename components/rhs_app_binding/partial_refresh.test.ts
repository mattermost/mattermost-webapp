// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {AppBinding} from '@mattermost/types/apps';

import {lookForBindingLocation, treeReplace} from './partial_refresh';

const initialBinding: AppBinding = {
    location: 'root',
    bindings: [
        {
            location: 'form',
            form: {
                fields: [
                    {
                        name: 'data-source',
                        label: 'The Label',
                        type: 'text',
                        subtype: 'textarea',
                        value: JSON.stringify({
                            location: 'data-view',
                            bindings: [
                                {
                                    location: 'original content',
                                },
                            ],
                        }, null, 2),
                    },
                ],
            },
        },
        {
            location: 'data-parent',
            bindings: [
                {
                    location: 'nested',
                    bindings: [
                        {
                            location: 'data-view',
                        },
                    ],
                },
            ],
        },
    ],
} as AppBinding;

describe('components/PartialRefresh', () => {
    describe('lookForBindingLocation', () => {
        test('valid location', () => {
            const found = lookForBindingLocation(initialBinding, 'data-view', []);
            expect(found).toEqual([1, 0, 0]);
        });

        test('invalid location', () => {
            const found = lookForBindingLocation(initialBinding, 'nonexistent', []);
            expect(found).toBeNull();
        });
    });

    describe('treeReplace', () => {
        test('valid location', () => {
            const newChild: AppBinding = {
                location: 'data-view',
                label: 'New value',
            };

            const newTree = treeReplace(initialBinding, newChild, [1, 0, 0]);
            expect(newTree.bindings![0]).toEqual(initialBinding.bindings![0]);
            expect(newTree.bindings![1].bindings![0].bindings![0]).toEqual(newChild);
        });
    });
});
