// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {NotificationType, NotificationCount} from 'mattermost-redux/types/notifications';
import {Dictionary} from 'mattermost-redux/types/utilities';

import Category from '../category';

import './app_icon.scss';

export type Props = {
    name: string;
    notificationTypes: NotificationType[];
    icon: string;
    counts: Dictionary<NotificationCount>;
}

type State = {
    collapsed: boolean;
    animating: boolean;
};

export default class AppIcon extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            //collapsed: props.app.notification_types.length <= 1,
            collapsed: true,
            animating: false,
        };
    }

    handleClick = () => {
        const {notificationTypes} = this.props;

        if (notificationTypes.length <= 1) {
            return;
        }

        this.setState({collapsed: !this.state.collapsed, animating: true});
    }

    animationComplete = () => {
        this.setState({animating: false});
    }

    renderBadge = () => {
        const {collapsed, animating} = this.state;
        if (!collapsed || animating) {
            return null;
        }

        const {notificationTypes, counts} = this.props;
        let numNotifications = 0;
        notificationTypes.forEach((category: NotificationType) => numNotifications += counts[category.name].value)

        if (numNotifications <= 0) {
            return null;
        }

        return <span className={'AppBadge'}>{numNotifications}</span>;
    }

    renderCategories = () => {
        const {collapsed, animating} = this.state;

        const {notificationTypes, counts} = this.props;

        let content = null;

        if (!collapsed || animating) {
            content = notificationTypes.map((category: NotificationType) => {
                const notificationCount = counts[category.name];
                return (
                    <Category
                        key={category.name}
                        icon={category.icon}
                        hoverText={category.description}
                        count={notificationCount.value}
                    />
                );
            });
        }

        return (
            <div className={collapsed ? 'AppIconCategories' : 'AppIconCategories expanded'} onTransitionEnd={this.animationComplete}>
                {content}
            </div>
        ); 
    }

    render() {
        const {icon, notificationTypes} = this.props;
        const {collapsed} = this.state;

        if (!notificationTypes.length) {
            return null;
        }

        return (
            <div className={collapsed ? 'AppIconContainer' : 'AppIconContainer expanded'}>
                {this.renderCategories()}
                <button className={collapsed ? 'AppIcon' : 'AppIcon expanded'} onClick={this.handleClick}>
                    <i className={'fa fa-2x ' + icon} />
                    {this.renderBadge()} 
                </button>
            </div>
        );
    }
}
