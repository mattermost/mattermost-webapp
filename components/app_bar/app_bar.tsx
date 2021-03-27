// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import AppIcon from './app_icon';

import {App} from 'mattermost-redux/types/notifications';

import './app_bar.scss';

interface ComponentProps {
    show?: boolean;
}

const apps: App[]= [
    {
        name: 'GitHub',
        icon: 'fa-github',
        notification_types: [
            {
                name: 'Pull Requests',
                icon: 'fa-compress',
                description: 'Your open pull requests',
            },
            {
                name: 'Review Requests',
                icon: 'fa-code-fork',
                description: 'Pull requests to review',
            },
            {
                name: 'Assignments',
                icon: 'fa-list-ol',
                description: 'Issues/pull requests assigned to you',
            },
            {
                name: 'Unreads',
                icon: 'fa-envelope',
                description: 'Unreads on issues/pull requests',
            }
        ],
    },
    {
        name: 'GitLab',
        icon: 'fa-gitlab',
        notification_types: [
            {
                name: 'Merge Requests',
                description: 'MRs to review',
                icon: '',
            }
        ],
    },
    {
        name: 'JIRA',
        icon: 'fa-rocket',
        notification_types: [
            {
                name: 'Unread Comments',
                description: 'Unread comments',
                icon: '',
            }
        ],
    }
];

const AppBar = (props: ComponentProps) => {
    const {show} = props;

    if (!show) {
        return null;
    }

    return (
        <div className='AppBar'>
            {apps.map(app => <AppIcon notificationTypes={app.notification_types}/>)} 
        </div>
    );
};

AppBar.defaultProps = {
    show: true,
};

export default AppBar;
