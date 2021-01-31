// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useEffect} from 'react';
import {Link, useRouteMatch, useLocation, matchPath} from 'react-router-dom';
import classNames from 'classnames';
import {useIntl} from 'react-intl';
import {useSelector, useDispatch} from 'react-redux';

import {getThreadCountsInCurrentTeam} from 'mattermost-redux/selectors/entities/threads';
import {getThreads} from 'mattermost-redux/actions/threads';

import {t} from 'utils/i18n';

import {isUnreadFilterEnabled} from 'selectors/views/channel_sidebar';
import {isCollapsedThreadsEnabled} from 'selectors/threads';

import {useThreadRouting} from '../hooks';

import ThreadsIcon from './threads_icon';

import './global_threads_link.scss';

const GlobalThreadsLink = () => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();
    const isFeatureEnabled = useSelector(isCollapsedThreadsEnabled);

    const {url, params: {team}} = useRouteMatch<{team: string}>();
    const {pathname} = useLocation();
    const threadsMatch = matchPath<{team: string; threadIdentifier?: string}>(pathname, '/:team/threads');
    const {currentTeamId, currentUserId} = useThreadRouting();

    const counts = useSelector(getThreadCountsInCurrentTeam);
    const unreadsOnly = useSelector(isUnreadFilterEnabled);
    const someUnreadThreads = counts?.total_unread_threads;

    useEffect(() => {
        if (!threadsMatch) {
            // only load initial 5 unread threads when not in /:team/threads
            // else, /:team/threads will take care of first counts on initial load of threads
            dispatch(getThreads(currentUserId, currentTeamId, {perPage: 5, unread: true}));
        }
    }, [team, Boolean(threadsMatch)]);

    if (!isFeatureEnabled || (unreadsOnly && !threadsMatch && !someUnreadThreads)) {
        // hide link if filtering unreads and there are no unread threads
        return null;
    }

    return (
        <ul className='NavGroupContent'>
            <li
                className={classNames('SidebarChannel SidebarGlobalThreads', {
                    active: Boolean(threadsMatch),
                    unread: someUnreadThreads,
                })}
            >
                <Link
                    to={`${url}/threads`}
                    draggable='false'
                    className='SidebarLink'
                    role='listitem'
                    tabIndex={-1}
                >
                    <span className='icon'>
                        <ThreadsIcon/>
                    </span>
                    <div className='SidebarChannelLinkLabel_wrapper'>
                        <span className='SidebarChannelLinkLabel'>
                            {formatMessage({id: t('globalThreads.sidebarLink'), defaultMessage: 'Threads'})}
                        </span>
                    </div>
                    {counts?.total_unread_threads > 0 && (
                        <span
                            id='unreadMentions'
                            className='badge'
                        >
                            {counts.total_unread_threads}
                        </span>
                    )}
                </Link>
            </li>
        </ul>
    );
};

export default memo(GlobalThreadsLink);
