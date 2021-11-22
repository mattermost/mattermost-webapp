// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect} from 'react';
import {Link, useRouteMatch, useLocation, matchPath} from 'react-router-dom';
import classNames from 'classnames';
import {useIntl} from 'react-intl';
import {useSelector, useDispatch} from 'react-redux';

import {
    getThreadCountsInCurrentTeam, getThreadsInCurrentTeam,
} from 'mattermost-redux/selectors/entities/threads';
import {getInt, isCollapsedThreadsEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {getThreads} from 'mattermost-redux/actions/threads';

import {t} from 'utils/i18n';

import {isUnreadFilterEnabled} from 'selectors/views/channel_sidebar';
import {useThreadRouting} from '../hooks';
import {trackEvent} from 'actions/telemetry_actions';

import ChannelMentionBadge from 'components/sidebar/sidebar_channel/channel_mention_badge';
import CRTWelcomeTutorialTip
    from '../../collapsed_reply_threads_tour/crt_welcome_tutorial_tip/crt_welcome_tutorial_tip';
import {GlobalState} from 'types/store';
import {isAnyModalOpen} from 'selectors/views/modals';
import Constants, {
    CrtTutorialSteps,
    CrtTutorialTriggerSteps,
    ModalIdentifiers,
    Preferences,
    TutorialSteps,
} from 'utils/constants';
import './global_threads_link.scss';
import CollapsedReplyThreadsModal
    from 'components/collapsed_reply_threads_tour/collapsed_reply_threads_modal/collapsed_reply_threads_modal';

import PulsatingDot from '../../widgets/pulsating_dot';
import {openModal} from '../../../actions/views/modals';

import ThreadsIcon from './threads_icon';

const GlobalThreadsLink = () => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();
    const isFeatureEnabled = useSelector(isCollapsedThreadsEnabled);

    const {url} = useRouteMatch();
    const {pathname} = useLocation();
    const inGlobalThreads = matchPath(pathname, {path: '/:team/threads/:threadIdentifier?'}) != null;
    const {currentTeamId, currentUserId} = useThreadRouting();

    const counts = useSelector(getThreadCountsInCurrentTeam);
    const unreadsOnly = useSelector(isUnreadFilterEnabled);
    const someUnreadThreads = counts?.total_unread_threads;
    const appHaveOpenModal = useSelector((state: GlobalState) => isAnyModalOpen(state));
    const tipStep = useSelector((state: GlobalState) => getInt(state, Preferences.CRT_TUTORIAL_STEP, currentUserId, CrtTutorialSteps.WELCOME_POPOVER));
    const crtTutorialTrigger = useSelector((state: GlobalState) => getInt(state, Preferences.CRT_TUTORIAL_TRIGGERED, currentUserId, Constants.CrtTutorialTriggerSteps.START));
    const onBoardingTutorialStep = useSelector((state: GlobalState) => getInt(state, Preferences.TUTORIAL_STEP, currentUserId, 0));
    const tutorialTipAutoTour = useSelector((state: GlobalState) => getInt(state, Preferences.CRT_TUTORIAL_AUTO_TOUR_STATUS, currentUserId, Constants.AutoTourStatus.ENABLED)) === Constants.AutoTourStatus.ENABLED;
    const threads = useSelector((state: GlobalState) => getThreadsInCurrentTeam(state));
    const showTutorialTip = crtTutorialTrigger === CrtTutorialTriggerSteps.STARTED && tipStep === CrtTutorialSteps.WELCOME_POPOVER && threads.length >= 1;
    const threadsCount = useSelector((state: GlobalState) => getThreadCountsInCurrentTeam(state));
    const showTutorialTrigger = isFeatureEnabled && onBoardingTutorialStep === TutorialSteps.FINISHED && crtTutorialTrigger === Constants.CrtTutorialTriggerSteps.START && !appHaveOpenModal && Boolean(threadsCount) && threadsCount.total >= 1;
    const openThreads = useCallback((e) => {
        e.stopPropagation();
        trackEvent('crt', 'go_to_global_threads');
        if (showTutorialTrigger) {
            dispatch(openModal({modalId: ModalIdentifiers.COLLAPSED_REPLY_THREADS_MODAL, dialogType: CollapsedReplyThreadsModal, dialogProps: {}}));
        }
    }, [showTutorialTrigger, threadsCount, threads]);

    useEffect(() => {
        // load counts if necessary
        if (isFeatureEnabled) {
            dispatch(getThreads(currentUserId, currentTeamId, {perPage: 5, totalsOnly: true}));
        }
    }, [currentTeamId, isFeatureEnabled]);

    if (!isFeatureEnabled || (unreadsOnly && !inGlobalThreads && !someUnreadThreads)) {
        // hide link if feature disabled or filtering unreads and there are no unread threads
        return null;
    }

    return (
        <ul className='SidebarGlobalThreads NavGroupContent nav nav-pills__container'>
            <li
                id={'sidebar-threads-button'}
                className={classNames('SidebarChannel', {
                    active: inGlobalThreads,
                    unread: someUnreadThreads,
                })}
                tabIndex={-1}
            >
                <Link
                    onClick={openThreads}
                    to={`${url}/threads`}
                    id='sidebarItem_threads'
                    draggable='false'
                    className={classNames('SidebarLink sidebar-item', {
                        'unread-title': Boolean(someUnreadThreads),
                    })}
                    role='listitem'
                    tabIndex={0}
                >
                    <span className='icon'>
                        <ThreadsIcon/>
                    </span>
                    <div className='SidebarChannelLinkLabel_wrapper'>
                        <span className='SidebarChannelLinkLabel sidebar-item__name'>
                            {formatMessage({id: t('globalThreads.sidebarLink'), defaultMessage: 'Threads'})}
                        </span>
                    </div>
                    {counts?.total_unread_mentions > 0 && (
                        <ChannelMentionBadge unreadMentions={counts.total_unread_mentions}/>
                    )}
                    {showTutorialTrigger && <PulsatingDot/>}
                </Link>
                {showTutorialTip && <CRTWelcomeTutorialTip autoTour={tutorialTipAutoTour}/>}
            </li>
        </ul>
    );
};

export default GlobalThreadsLink;
