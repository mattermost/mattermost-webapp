// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useEffect} from 'react';
import {Link, useRouteMatch, useLocation} from 'react-router-dom';
import classNames from 'classnames';
import {useIntl} from 'react-intl';

import {t} from 'utils/i18n';

import {useStickyState} from 'stores/hooks';

import ThreadsIcon from './threads_icon';

import './global_threads_link.scss';

const GlobalThreadsLink = () => {
    const {path, url, params: {threadIdentifier}} = useRouteMatch<{team: string; threadIdentifier?: string;}>();
    const {pathname} = useLocation();
    const {formatMessage} = useIntl();
    const [lastThread, setLastThread] = useStickyState(null, 'globalThreads_lastThread');
    useEffect(() => {
        if (threadIdentifier) {
            setLastThread(threadIdentifier);
        }
    });

    return (
        <ul className='NavGroupContent'>
            <li
                className={classNames('SidebarChannel', {
                    active: path === '/:team' && pathname.includes(`${url}/threads`),
                })}
            >
                <Link
                    to={`${url}/threads` + (lastThread ? `/${lastThread}` : '')}
                    draggable='false'
                    className='SidebarLink SidebarGlobalThreads'
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
                </Link>
            </li>
        </ul>

    );
};

export default memo(GlobalThreadsLink);
