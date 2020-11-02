// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import {shouldRenderFromPropsAndState} from 'components/search_results/search_results.jsx';

describe('components/SearchResults', () => {
    describe('shouldRenderFromPropsAndState', () => {
        const result1 = {test: 'test'};
        const result2 = {test: 'test'};
        const results = [result1, result2];
        const props = {
            prop1: 'someprop',
            somearray: [1, 2, 3],
            results,
        };

        test('should not render', () => {
            assert.ok(!shouldRenderFromPropsAndState(props, {...props}, props, {...props}));
            assert.ok(!shouldRenderFromPropsAndState(props, {...props, prop1: 'someprop'}, props, {...props}));
            assert.ok(!shouldRenderFromPropsAndState(props, {...props, results: [result1, result2]}, props, {...props}));
        });

        test('should render', () => {
            assert.ok(shouldRenderFromPropsAndState(props, {...props, prop1: 'newprop'}, props, {...props}));
            assert.ok(shouldRenderFromPropsAndState(props, {...props}, props, {...props, prop1: 'newprop'}));
            assert.ok(shouldRenderFromPropsAndState(props, {...props, results: [result2, result1]}, props, {...props}));
            assert.ok(shouldRenderFromPropsAndState(props, {...props, results: [result1, result2, {test: 'test'}]}, props, {...props}));
            assert.ok(shouldRenderFromPropsAndState(props, {...props, somearray: [1, 2, 3]}, props, {...props}));
        });
    });
});
