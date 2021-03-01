// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {searchHintOptions} from 'utils/constants';

import SearchHint from 'components/search_hint/search_hint';

describe('components/SearchHint', () => {
    const baseProps = {
        withTitle: false,
        onOptionSelected: jest.fn(),
        onSearchTypeSelected: jest.fn(),
        options: searchHintOptions,
        filesSearchEnabled: false,
    };

    test('should match snapshot, with title', () => {
        const props = {
            ...baseProps,
            withTitle: true,
        };
        const wrapper = shallow(
            <SearchHint {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, without title', () => {
        const wrapper = shallow(
            <SearchHint {...baseProps}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, without searchType and filesSearchEnabled', () => {
        const props = {
            ...baseProps,
            withTitle: true,
            filesSearchEnabled: true,
            searchType: '' as 'files' | 'messages' | '',
        };
        const wrapper = shallow(
            <SearchHint {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, with searchType and filesSearchEnabled', () => {
        const props = {
            ...baseProps,
            filesSearchEnabled: true,
            searchType: 'files' as 'files' | 'messages' | '',
        };
        const wrapper = shallow(
            <SearchHint {...props}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
