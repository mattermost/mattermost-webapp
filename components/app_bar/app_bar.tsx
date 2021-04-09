// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {FC, useEffect} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import {getMyNotificationCounts, getMyNotifications, getProviders} from 'mattermost-redux/actions/notifications';
import {App} from 'mattermost-redux/types/notifications';

import './app_bar.scss';
import {GlobalState} from 'mattermost-redux/types/store';

import AppIcon from './app_icon';

/*const apps: App[] = [
    {
        name: 'Github',
        icon: 'fa-github',
        types: [
            {
                name: 'PullRequest',
                icon: 'fa-compress',
                description: 'Your open pull requests',
            },
            {
                name: 'ReviewRequest',
                icon: 'fa-code-fork',
                description: 'Pull requests to review',
            },
            {
                name: 'Assignment',
                icon: 'fa-list-ol',
                description: 'Issues/pull requests assigned to you',
            },
            {
                name: 'Unread',
                icon: 'fa-envelope',
                description: 'Unreads on issues/pull requests',
            },
        ],
    },
    {
        name: 'GitLab',
        icon: 'fa-gitlab',
        types: [
            {
                name: 'MergeRequest',
                description: 'MRs to review',
                icon: '',
            },
        ],
    },
    {
        name: 'Jira',
        icon: 'fa-rocket',
        types: [
            {
                name: 'UnreadComment',
                description: 'Unread comments',
                icon: '',
            },
        ],
    },
    ];*/

type Props = {
    hide?: boolean;
}

const AppBar: FC<Props> = (props: Props) => {
    const dispatch = useDispatch();
    const apps = useSelector<App[]>((state: GlobalState) => state.entities.notifications.providers);

    useEffect(() => {
        if (!props.hide) {
            dispatch(getMyNotifications());
            dispatch(getMyNotificationCounts());
            dispatch(getProviders());
        }
    }, [props.hide]);

    if (props.hide || !apps) {
        return null;
    }

    return (
        <div className='AppBar'>
            {apps.map((app) => (<AppIcon
                icon={app.icon}
                name={app.name}
                notificationTypes={app.types}
                                />))}
        </div>
    );
};

export default AppBar;
