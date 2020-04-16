// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import {SearchHint} from 'components/search_hint/search_hint';

describe('components/SearchHint', () => {
    const updateSearchTerms = jest.fn();

    test('should match snapshot, with title', () => {
        const wrapper = shallow(
            <SearchHint
                withTitle={true}
                updateSearchTerms={updateSearchTerms}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, without title', () => {
        const wrapper = shallow(
            <SearchHint updateSearchTerms={updateSearchTerms}/>
        );
        expect(wrapper).toMatchSnapshot();
    });
});
