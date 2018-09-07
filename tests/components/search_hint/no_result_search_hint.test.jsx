// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import NoResultSearchHint from 'components/search_hint/no_result_search_hint';

describe('components/NoResultSearchHint', () => {
    test('should match snapshot, with data retention', () => {
        const wrapper = shallow(
            <NoResultSearchHint
                dataRetentionEnableMessageDeletion={true}
                dataRetentionMessageRetentionDays={'30'}
            />
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot, without data retention', () => {
        const wrapper = shallow(
            <NoResultSearchHint/>
        );
        expect(wrapper).toMatchSnapshot();
    });
});
