// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import SearchResultsHeader from './search_results_header.jsx';

describe('components/SearchResultsHeader', () => {
    const baseProps = {
        children: 'Mentions',
        isExpanded: true,
        actions: {
            closeRightHandSide: jest.fn(),
            toggleRhsExpanded: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<SearchResultsHeader {...baseProps}/>);
        expect(wrapper).toMatchSnapshot();
    });

    const props = {
        ...baseProps,
        isExpanded: false
    };

    test('should match snapshot', () => {
        const wrapper = shallow(<SearchResultsHeader {...props}/>);
        expect(wrapper).toMatchSnapshot();
    });
});