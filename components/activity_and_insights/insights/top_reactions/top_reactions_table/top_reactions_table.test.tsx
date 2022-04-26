// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {shallow} from 'enzyme';

import {TimeFrames} from '@mattermost/types/insights';

import TopReactionsTable from './top_reactions_table';

describe('components/activity_and_insights/insights/top_reactions/top_reactions_table', () => {
    const props = {
        filterType: 'TEAM',
        timeFrame: TimeFrames.INSIGHTS_7_DAYS,
    };

    test('should match snapshot with team', () => {
        const wrapper = shallow(
            <TopReactionsTable
                {...props}
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    test('should match snapshot with My insights', () => {
        // const wrapper = shallow(
        //     <InsightsModal
        //         {...props}
        //         filterType={'MY'}
        //         title={'My top reactions'}
        //         subtitle={'Reactions I\'ve used the most'}
        //         timeFrame={TimeFrames.INSIGHTS_1_DAY}
        //         timeFrameLabel={'Today'}
        //     />,
        // );
        // expect(wrapper).toMatchSnapshot();
    });
});
