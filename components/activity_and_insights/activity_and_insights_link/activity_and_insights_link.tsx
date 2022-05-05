// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useState} from 'react';
import {Link, useRouteMatch, useLocation, matchPath} from 'react-router-dom';
import {FormattedMessage, useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import classNames from 'classnames';
import Icon from '@mattermost/compass-components/foundations/icon';

import {insightsAreEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {Preferences} from 'mattermost-redux/constants';
import {setInsightsInitialisationState} from 'mattermost-redux/actions/preferences';
import {showInsightsPulsatingDot} from 'selectors/insights';
import insightsPreview from 'images/Insights-Preview-Image.jpg';
import {t} from 'utils/i18n';
import {trackEvent} from 'actions/telemetry_actions';

import TourTip from 'components/widgets/tour_tip';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

import './activity_and_insights_link.scss';

const title = (
    <FormattedMessage
        id='activityAndInsights.tutorialTip.title'
        defaultMessage='Introducing: Insights'
    />
);

const screen = (
    <>
        <FormattedMarkdownMessage
            id='activityAndInsights.tutorialTip.description'
            defaultMessage='Check out the new Insights feature added to your workspace. See what content is most active, and learn how you and your teammates are using your workspace.'
        />
        <img
            src={insightsPreview}
            className='insights-img'
        />
    </>

);

const prevBtn = (
    <FormattedMessage
        id={'activityAndInsights.tutorial_tip.notNow'}
        defaultMessage={'Not now'}
    />
);

const nextBtn = (
    <FormattedMessage
        id={'activityAndInsights.tutorial_tip.viewInsights'}
        defaultMessage={'View insights'}
    />
);

const ActivityAndInsightsLink = () => {
    const dispatch = useDispatch();
    const {formatMessage} = useIntl();
    const insightsEnabled = useSelector(insightsAreEnabled);
    const showTip = useSelector(showInsightsPulsatingDot);

    const [tipOpened, setTipOpened] = useState(showTip);

    const {url} = useRouteMatch();
    const {pathname} = useLocation();
    const inInsights = matchPath(pathname, {path: '/:team/activity-and-insights'}) != null;

    const openInsights = useCallback((e) => {
        e.stopPropagation();
        trackEvent('insights', 'go_to_insights');
    }, []);

    if (!insightsEnabled) {
        return null;
    }

    const handleDismiss = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(setInsightsInitialisationState({[Preferences.INSIGHTS_VIEWED]: true}));
        setTipOpened(false);
    };

    const handleNext = () => {
        dispatch(setInsightsInitialisationState({[Preferences.INSIGHTS_VIEWED]: true}));
        setTipOpened(false);
    };

    const handleOpen = (e: React.MouseEvent) => {
        e.stopPropagation();
        setTipOpened(true);
    };

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
                    role='listitem'
                    tabIndex={0}
                >
                    <span className='icon'>
                        <Icon
                            size={12}
                            glyph={'chart-line'}
                        />
                    </span>
                    <div className='SidebarChannelLinkLabel_wrapper'>
                        <span className='SidebarChannelLinkLabel sidebar-item__name'>
                            {formatMessage({id: t('activityAndInsights.sidebarLink'), defaultMessage: 'Insights'})}
                        </span>
                    </div>
                    {
                        showTip &&
                        <TourTip
                            show={tipOpened}
                            screen={screen}
                            title={title}
                            overlayPunchOut={null}
                            placement='right'
                            pulsatingDotPlacement='right'
                            step={1}
                            singleTip={true}
                            showOptOut={false}
                            interactivePunchOut={true}
                            handleDismiss={handleDismiss}
                            handleNext={handleNext}
                            handleOpen={handleOpen}
                            handlePrevious={handleDismiss}
                            nextBtn={nextBtn}
                            prevBtn={prevBtn}
                            offset={[140, 4]}
                        />
                    }

                </Link>
            </li>
        </ul>
    );
};

export default ActivityAndInsightsLink;
