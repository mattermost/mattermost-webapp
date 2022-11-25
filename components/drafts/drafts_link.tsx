// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {NavLink, useRouteMatch} from 'react-router-dom';
import {useIntl} from 'react-intl';

import {localDraftsAreEnabled} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import {getDrafts} from 'actions/views/drafts';

import {makeGetDraftsCount} from 'selectors/drafts';

import ChannelMentionBadge from 'components/sidebar/sidebar_channel/channel_mention_badge';

import './drafts_link.scss';

const getDraftsCount = makeGetDraftsCount();

function DraftsLink() {
    const dispatch = useDispatch();
    const localDraftsEnabled = useSelector(localDraftsAreEnabled);
    const {formatMessage} = useIntl();
    const {url} = useRouteMatch();
    const match = useRouteMatch('/:team/drafts');
    const count = useSelector(getDraftsCount);
    const teamId = useSelector(getCurrentTeamId);

    useEffect(() => {
        if (localDraftsEnabled) {
            dispatch(getDrafts(teamId));
        }
    }, [teamId, localDraftsEnabled, dispatch]);

    if (!localDraftsEnabled || (!count && !match)) {
        return null;
    }

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
                            {formatMessage({id: 'drafts.sidebarLink', defaultMessage: 'Drafts'})}
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
