// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import LoadingWrapper from './loading_wrapper.jsx';

describe('components/widgets/LoadingWrapper', () => {
    const testCases = [
        {
            name: 'showing spinner with text',
            loading: true,
            type: 'spinner',
            text: 'test',
            children: 'children',
            snapshot: `
<LoadingIndicator
  text="test"
  type="spinner"
/>
`,
        },
        {
            name: 'showing spinner without text',
            loading: true,
            type: 'spinner',
            children: 'text',
            snapshot: `
<LoadingIndicator
  text={null}
  type="spinner"
/>
`,
        },
        {
            name: 'showing bars with text',
            loading: true,
            type: 'bars',
            text: 'test',
            children: 'text',
            snapshot: `
<LoadingIndicator
  text="test"
  type="bars"
/>
`,
        },
        {
            name: 'showing bars without text',
            loading: true,
            type: 'bars',
            children: 'text',
            snapshot: `
<LoadingIndicator
  text={null}
  type="bars"
/>
`,
        },
        {
            name: 'showing content with children',
            loading: false,
            children: 'text',
            snapshot: '"text"',
        },
        {
            name: 'showing content without children',
            loading: false,
            snapshot: '""',
        },
    ];
    for (const testCase of testCases) {
        test(testCase.name, () => {
            const wrapper = shallow(
                <LoadingWrapper
                    loading={testCase.loading}
                    text={testCase.text}
                    type={testCase.type}
                >
                    {testCase.children}
                </LoadingWrapper>
            );
            expect(wrapper).toMatchInlineSnapshot(testCase.snapshot, '""');
        });
    }
});
