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
        },
        {
            name: 'showing spinner without text',
            loading: true,
            type: 'spinner',
            children: 'text',
        },
        {
            name: 'showing bars with text',
            loading: true,
            type: 'bars',
            text: 'test',
            children: 'text',
        },
        {
            name: 'showing bars without text',
            loading: true,
            type: 'bars',
            children: 'text',
        },
        {
            name: 'showing content with children',
            loading: false,
            children: 'text',
        },
        {
            name: 'showing content without children',
            loading: false,
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
            expect(wrapper).toMatchSnapshot();
        });
    }
});
