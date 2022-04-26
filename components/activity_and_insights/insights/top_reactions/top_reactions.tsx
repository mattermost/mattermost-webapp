// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo} from 'react';

import BarChartLoader from '../skeleton_loader/bar_chart_loader/bar_chart_loader';
import CircleLoader from '../skeleton_loader/circle_loader/circle_loader';
import widgetHoc from '../widget_hoc/widget_hoc';

import './../../activity_and_insights.scss';

// eslint-disable-next-line no-empty-pattern
const TopReactions = ({}) => {
    return (
        <div className='top-reaction-container'>
            <div className='bar-chart-entry'>
                <BarChartLoader/>
                <CircleLoader
                    size={20}
                />
            </div>
            <div className='bar-chart-entry'>
                <BarChartLoader/>
                <CircleLoader
                    size={20}
                />
            </div>
            <div className='bar-chart-entry'>
                <BarChartLoader/>
                <CircleLoader
                    size={20}
                />
            </div>
            <div className='bar-chart-entry'>
                <BarChartLoader/>
                <CircleLoader
                    size={20}
                />
            </div>
            <div className='bar-chart-entry'>
                <BarChartLoader/>
                <CircleLoader
                    size={20}
                />
            </div>
        </div>
    );
};

export default memo(widgetHoc(TopReactions));
