// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import DataRetentionHint from 'components/search_hint/data_retention_hint';

describe('components/DataRetentionHint', () => {
    test('should match snapshot', () => {
        const wrapper = shallow(
            <DataRetentionHint dataRetentionMessageRetentionDays={'30'}/>,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
