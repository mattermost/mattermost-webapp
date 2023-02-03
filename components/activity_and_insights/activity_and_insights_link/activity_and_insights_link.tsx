// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {useSelector} from 'react-redux';
import {Link, useRouteMatch, useLocation, matchPath} from 'react-router-dom';
import {useIntl} from 'react-intl';
import classNames from 'classnames';
import {ChartLineIcon} from '@mattermost/compass-icons/components';

import {insightsAreEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {trackEvent} from 'actions/telemetry_actions';
import {t} from 'utils/i18n';

import InsightsTourTip from './insights_tour_tip/insights_tour_tip';

import './activity_and_insights_link.scss';

const ActivityAndInsightsLink = () => {
    const {formatMessage} = useIntl();
    const insightsEnabled = useSelector(insightsAreEnabled);

    const {url} = useRouteMatch();
    const {pathname} = useLocation();
    const inInsights = matchPath(pathname, {path: '/:team/activity-and-insights'}) != null;

    const openInsights = useCallback((e) => {
        e.stopPropagation();
        trackEvent('insights', 'sidebar_open_insights');
    }, []);

    if (!insightsEnabled) {
        return null;
    }

    return (
        <ul className='SidebarInsights NavGroupContent nav nav-pills__container'>
            <li
                id={'sidebar-insights-button'}
                className={classNames('SidebarChannel', {
                    active: inInsights,
                })}
                tabIndex={-1}
            >
                <Link
                    onClick={openInsights}
                    to={`${url}/activity-and-insights`}
                    id='sidebarItem_insights'
                    draggable='false'
                    className={'SidebarLink sidebar-item'}
                    tabIndex={0}
                >
                    <span className='icon'>
                        <ChartLineIcon size={12}/>
                    </span>
                    <div className='SidebarChannelLinkLabel_wrapper'>
                        <span className='SidebarChannelLinkLabel sidebar-item__name'>
                            {formatMessage({id: t('activityAndInsights.sidebarLink'), defaultMessage: 'Insights'})}
                        </span>
                    </div>
                </Link>
                <InsightsTourTip/>
            </li>
        </ul>
    );
};

export default ActivityAndInsightsLink;
