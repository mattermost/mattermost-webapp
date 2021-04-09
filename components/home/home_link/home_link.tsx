// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {Link, useRouteMatch, useLocation, matchPath} from 'react-router-dom';
import classNames from 'classnames';
import {useIntl} from 'react-intl';
import {useDispatch} from 'react-redux';

import {t} from 'utils/i18n';

import {getMyNotifications} from 'mattermost-redux/actions/notifications';

import HomeIcon from './home_icon';

import './home_link.scss';

const HomeLink = () => {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();
    const isFeatureEnabled = true;

    const {url} = useRouteMatch();
    const {pathname} = useLocation();
    const inHome = matchPath(pathname, {path: '/:team/home'}) != null;

    useEffect(() => {
        if (isFeatureEnabled) {
            dispatch(getMyNotifications());
        }
    });

    if (!isFeatureEnabled) {
        return null;
    }

    return (
        <ul className='SidebarHome NavGroupContent nav nav-pills__container'>
            <li
                className={classNames('SidebarChannel', {
                    active: inHome,
                })} 
                tabIndex={-1}
            >
                <Link
                    to={`${url}/home`}
                    draggable='false'
                    className='SidebarLink sidebar-item'
                    role='listitem'
                    tabIndex={0}
                >
                    <span className='icon'>
                        <HomeIcon/>
                    </span>
                    <div className='SidebarChannelLinkLabel_wrapper'>
                        <span className='SidebarChannelLinkLabel sidebar-item__name'>
                            {formatMessage({id: t('home.sidebarLink'), defaultMessage: 'Home'})}
                        </span>
                    </div>
                </Link>
            </li>
        </ul>
    );
};

export default HomeLink;
