// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import AppIcon from './app_icon';

import {App} from 'mattermost-redux/types/notifications';

import './app_bar.scss';

const apps: App[]= [
    {
        name: 'Github',
        icon: 'fa-github',
        notification_types: [
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
            }
        ],
    },
    {
        name: 'GitLab',
        icon: 'fa-gitlab',
        notification_types: [
            {
                name: 'MergeRequest',
                description: 'MRs to review',
                icon: '',
            }
        ],
    },
    {
        name: 'Jira',
        icon: 'fa-rocket',
        notification_types: [
            {
                name: 'UnreadComment',
                description: 'Unread comments',
                icon: '',
            }
        ],
    }
];

type Props = {
    show: boolean;
    actions: {
        getMyNotificationCounts: () => void;
    };
}

export default class AppBar extends React.Component<Props> {
    static defaultProps = {
        show: true,
    };

    componentDidMount() {
        const {actions, show} = this.props;

        if (show) {
            actions.getMyNotificationCounts();
        }
    }

    componentDidUpdate(prevProps: Props) {
        const {actions, show} = this.props;

        if (!prevProps.show && show) {
            actions.getMyNotificationCounts();
        }
    }

    render() {
        const {show} = this.props;

        if (!show) {
            return null;
        }

        return (
            <div className='AppBar'>
                {apps.map(app => <AppIcon icon={app.icon} name={app.name} notificationTypes={app.notification_types}/>)} 
            </div>
        );
    }
};
