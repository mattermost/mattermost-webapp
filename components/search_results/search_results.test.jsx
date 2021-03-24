// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import {arePropsEqual} from 'components/search_results/search_results.tsx';

describe('components/SearchResults', () => {
    describe('shouldRenderFromProps', () => {
        const result1 = {test: 'test'};
        const result2 = {test: 'test'};
        const results = [result1, result2];
        const props = {
            prop1: 'someprop',
            somearray: [1, 2, 3],
            results,
        };

        test('should not render', () => {
            assert.ok(arePropsEqual(props, {...props}));
            assert.ok(arePropsEqual(props, {...props, results: [result1, result2]}, props, {...props}));
        });

        test('should render', () => {
            assert.ok(!arePropsEqual(props, {...props, prop1: 'newprop'}));
            assert.ok(!arePropsEqual(props, {...props, results: [result2, result1]}));
            assert.ok(!arePropsEqual(props, {...props, results: [result1, result2, {test: 'test'}]}));
            assert.ok(!arePropsEqual(props, {...props, somearray: [1, 2, 3]}));
        });
    });
});
