// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {useSelector} from 'react-redux';
import {NavLink, useRouteMatch} from 'react-router-dom';
import {useIntl} from 'react-intl';

import {makeGetDraftsCount} from 'selectors/drafts';

import ChannelMentionBadge from 'components/sidebar/sidebar_channel/channel_mention_badge';

import {t} from 'utils/i18n';

import './drafts_link.scss';

const getDraftsCount = makeGetDraftsCount();

function DraftsLink() {
    const {formatMessage} = useIntl();
    const {url} = useRouteMatch();
    const count = useSelector(getDraftsCount);

    return (
        <ul className='SidebarDrafts NavGroupContent nav nav-pills__container'>
            <li
                className='SidebarChannel'
                tabIndex={-1}
            >
                <NavLink
                    to={`${url}/drafts`}
                    id='sidebarItem_drafts'
                    activeClassName='active'
                    draggable='false'
                    className='SidebarLink sidebar-item'
                    role='listitem'
                    tabIndex={0}
                >
                    <i
                        data-testid='draftIcon'
                        className='icon icon-pencil-outline'
                    />
                    <div className='SidebarChannelLinkLabel_wrapper'>
                        <span className='SidebarChannelLinkLabel sidebar-item__name'>
                            {formatMessage({id: t('drafts.sidebarLink'), defaultMessage: 'Drafts'})}
                        </span>
                    </div>
                    {count > 0 && (
                        <ChannelMentionBadge unreadMentions={count}/>
                    )}
                </NavLink>
            </li>
        </ul>
    );
}

export default memo(DraftsLink);
