// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {Link, useRouteMatch, useLocation, matchPath} from 'react-router-dom';
import classNames from 'classnames';
import {useIntl} from 'react-intl';

import {t} from 'utils/i18n';

import ThreadsIcon from './threads_icon';

import './global_threads_link.scss';

const GlobalThreadsLink = () => {
    const {url} = useRouteMatch<{team: string}>();
    const {pathname} = useLocation();

    const threadsMatch = matchPath<{team: string; threadIdentifier?: string}>(pathname, '/:team/threads');

    const {formatMessage} = useIntl();

    return (
        <ul className='NavGroupContent'>
            <li
                className={classNames('SidebarChannel SidebarGlobalThreads', {
                    active: Boolean(threadsMatch),
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
                </Link>
            </li>
        </ul>

    );
};

export default memo(GlobalThreadsLink);
