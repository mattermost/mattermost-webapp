// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import SearchHint from 'components/search_hint/search_hint';

describe('components/SearchHint', () => {
    test('should match snapshot, with title', () => {
        const wrapper = shallow(
            <SearchHint withTitle={true}/>
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, without title', () => {
        const wrapper = shallow(
            <SearchHint/>
        );
        expect(wrapper).toMatchSnapshot();
    });
});
