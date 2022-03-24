// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {Link, useRouteMatch} from 'react-router-dom';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';

import {isInsightsEnabled} from 'mattermost-redux/selectors/entities/preferences';

import {t} from 'utils/i18n';

import {trackEvent} from 'actions/telemetry_actions';

const ActivityAndInsightsLink = () => {
    const {formatMessage} = useIntl();
    const insightsEnabled = useSelector(isInsightsEnabled);

    const {url} = useRouteMatch();

    const openInsights = useCallback((e) => {
        e.stopPropagation();
        trackEvent('insights', 'go_to_insights');
    }, []);

    if (!insightsEnabled) {
        return null;
    }

    return (
        <ul className='SidebarGlobalThreads NavGroupContent nav nav-pills__container'>
            <li
                id={'sidebar-threads-button'}
                className={'SidebarChannel'}
                tabIndex={-1}
            >
                <Link
                    onClick={openInsights}
                    to={`${url}/activity-and-insights`}
                    id='sidebarItem_threads'
                    draggable='false'
                    className={'SidebarLink sidebar-item'}
                    role='listitem'
                    tabIndex={0}
                >
                    <div className='SidebarChannelLinkLabel_wrapper'>
                        <span className='SidebarChannelLinkLabel sidebar-item__name'>
                            {formatMessage({id: t('activityAndInsights.sidebarLink'), defaultMessage: 'Insights'})}
                        </span>
                    </div>
                </Link>
            </li>
        </ul>
    );
};

export default ActivityAndInsightsLink;
