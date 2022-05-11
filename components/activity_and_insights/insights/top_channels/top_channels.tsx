// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useCallback, useState} from 'react';

import CircleLoader from '../skeleton_loader/circle_loader/circle_loader';
import TitleLoader from '../skeleton_loader/title_loader/title_loader';
import LineChartLoader from '../skeleton_loader/line_chart_loader/line_chart_loader';
import widgetHoc from '../widget_hoc/widget_hoc';

import './../../activity_and_insights.scss';

// eslint-disable-next-line no-empty-pattern
const TopChannels = ({}) => {
    const [loading] = useState(true);

    const skeletonTitle = useCallback(() => {
        const titles = [];
        for (let i = 0; i < 5; i++) {
            titles.push(
                <div
                    className='top-channel-row'
                    key={i}
                >
                    <CircleLoader
                        size={16}
                    />
                    <TitleLoader/>
                </div>,
            );
        }
        return titles;
    }, []);

    return (
        <div className='top-channel-container'>
            <div className='top-channel-line-chart'>
                {
                    loading &&
                    <LineChartLoader/>
                }
            </div>
            <div className='top-channel-list'>
                {
                    loading &&
                    skeletonTitle()
                }
            </div>
        </div>
    );
};

export default memo(widgetHoc(TopChannels));
