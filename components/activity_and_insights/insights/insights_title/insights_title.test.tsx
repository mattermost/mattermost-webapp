// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {shallow} from 'enzyme';

import InsightsTitle from './insights_title';

describe('components/activity_and_insights/insights/insights_title', () => {
    const props = {
        filterType: 'TEAM',
        setFilterTypeMy: jest.fn(),
        setFilterTypeTeam: jest.fn(),
    };

    test('should match snapshot with team', () => {
        const wrapper = shallow(
            <InsightsTitle
                {...props}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with My insights', () => {
        const wrapper = shallow(
            <InsightsTitle
                {...props}
                filterType={'MY'}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
