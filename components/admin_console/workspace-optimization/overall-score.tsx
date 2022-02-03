// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {FormattedMessage} from 'react-intl';

import CircularChart from 'components/common/circular_chart/circular_chart';
import WarningSvg from 'components/common/svg_images_components/warning_svg';

import './dashboard.scss';

type OverallScoreProps = {
    title?: React.ReactNode;
    description?: React.ReactNode;
    chips: React.ReactNode;
    chartValue: number;
};

const OverallScore = ({
    chips,
    title,
    description,
    chartValue,
}: OverallScoreProps): JSX.Element | null => {
    const contentTitle = title || (
        <FormattedMessage
            id='admin.reporting.workspace_optimization.overall_workspace_score'
            defaultMessage='Overall Workspace Score'
        />
    );
    const contentDescription = description || (
        <FormattedMessage
            id='admin.reporting.workspace_optimization.overall_workspace_score_description'
            defaultMessage='Stay on top of how optimized your workspace is! This score is a total of the categories of key indicators of health and growth below. Ensure your workspace is in its most optimized state so you and your user base get the most out of Mattermost.'
        />
    );
    return (
        <div className='OverallScore'>
            <div className='OverallScore__scoreEllipseSvg'>
                {chartValue < 50 ? (
                    <div className='alertImageScore'>
                        <WarningSvg
                            width={48}
                            height={48}
                        />
                    </div>
                ) : (
                    <CircularChart
                        value={chartValue}
                        isPercentage={false}
                        width={140}
                        height={140}
                        type={'success'}
                    />
                )}
            </div>
            <div className='OverallScore__content'>
                <div className='OverallScore__content__title'>
                    {contentTitle}
                </div>
                <div className='OverallScore__content__description'>
                    {contentDescription}
                </div>
                <div className='OverallScore__content__chips'>
                    {chips}
                </div>
            </div>
        </div>
    );
};

export default OverallScore;
