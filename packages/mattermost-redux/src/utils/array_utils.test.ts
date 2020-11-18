// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {insertWithoutDuplicates, removeItem} from './array_utils';

describe('insertWithoutDuplicates', () => {
    test('should add the item at the given location', () => {
        expect(insertWithoutDuplicates(['a', 'b', 'c', 'd'], 'z', 0)).toEqual(['z', 'a', 'b', 'c', 'd']);
        expect(insertWithoutDuplicates(['a', 'b', 'c', 'd'], 'z', 1)).toEqual(['a', 'z', 'b', 'c', 'd']);
        expect(insertWithoutDuplicates(['a', 'b', 'c', 'd'], 'z', 2)).toEqual(['a', 'b', 'z', 'c', 'd']);
        expect(insertWithoutDuplicates(['a', 'b', 'c', 'd'], 'z', 3)).toEqual(['a', 'b', 'c', 'z', 'd']);
        expect(insertWithoutDuplicates(['a', 'b', 'c', 'd'], 'z', 4)).toEqual(['a', 'b', 'c', 'd', 'z']);
    });

    test('should move an item if it already exists', () => {
        expect(insertWithoutDuplicates(['a', 'b', 'c', 'd'], 'a', 0)).toEqual(['a', 'b', 'c', 'd']);
        expect(insertWithoutDuplicates(['a', 'b', 'c', 'd'], 'a', 1)).toEqual(['b', 'a', 'c', 'd']);
        expect(insertWithoutDuplicates(['a', 'b', 'c', 'd'], 'a', 2)).toEqual(['b', 'c', 'a', 'd']);
        expect(insertWithoutDuplicates(['a', 'b', 'c', 'd'], 'a', 3)).toEqual(['b', 'c', 'd', 'a']);
    });

    test('should return the original array if nothing changed', () => {
        const input = ['a', 'b', 'c', 'd'];

        expect(insertWithoutDuplicates(input, 'a', 0)).toBe(input);
    });
});

describe('removeItem', () => {
    test('should remove the given item', () => {
        expect(removeItem(['a', 'b', 'c', 'd'], 'a')).toEqual(['b', 'c', 'd']);
        expect(removeItem(['a', 'b', 'c', 'd'], 'b')).toEqual(['a', 'c', 'd']);
        expect(removeItem(['a', 'b', 'c', 'd'], 'c')).toEqual(['a', 'b', 'd']);
        expect(removeItem(['a', 'b', 'c', 'd'], 'd')).toEqual(['a', 'b', 'c']);
    });

    test('should return the original array if nothing changed', () => {
        const input = ['a', 'b', 'c', 'd'];

        expect(removeItem(input, 'e')).toBe(input);
    });
});
