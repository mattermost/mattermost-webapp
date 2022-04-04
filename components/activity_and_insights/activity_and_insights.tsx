// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo} from 'react';

import {useIntl} from 'react-intl';
import classNames from 'classnames';

import Header from 'components/widgets/header';

import './activity_and_insights.scss';

import Insights from './insights/insights';

const ActivityAndInsights = () => {
    const {formatMessage} = useIntl();

    /**
     * Here we can do a check to see if both insights and activity are enabled. If that condition is true we can render the tabbed header.
     * Otherwise we can render either insights or activity based on which flag is enabled.
     */
    return (
        <div
            id='app-content'
            className={classNames('ActivityAndInsights app__content')}
        >
            <Header
                level={2}
                className={'ActivityAndInsights___header'}
                heading={formatMessage({
                    id: 'insights.teamHeading',
                    defaultMessage: 'Team Insights',
                })}
            />
            <Insights/>
        </div>
    );
};

export default memo(ActivityAndInsights);
