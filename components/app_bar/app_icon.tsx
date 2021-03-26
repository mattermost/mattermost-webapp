// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {App, NotificationCategory} from './types';

import Category from './category';

import './app_icon.scss';

type Props = {
    app: App;
}

type State = {
    collapsed: boolean;
    animating: boolean;
};

export default class AppIcon extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            //collapsed: props.app.notifications_categories.length <= 1,
            collapsed: true,
            animating: false,
        };
    }

    handleClick = () => {
        const {app} = this.props;

        if (app.notifications_categories.length <= 1) {
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

        const {app} = this.props;
        const notificationCatgeories = app.notifications_categories;
        let numNotifications = 0;
        notificationCatgeories.forEach((category: NotificationCategory) => numNotifications += category.notifications.length)

        if (numNotifications <= 0) {
            return null;
        }

        return <span className={'AppBadge'}>{numNotifications}</span>;
    }

    renderCategories = () => {
        const {collapsed, animating} = this.state;

        const {app} = this.props;
        const notificationCatgeories = app.notifications_categories;

        let content = null;

        if (!collapsed || animating) {
            content = notificationCatgeories.map((category: NotificationCategory) => <Category key={category.name} category={category}/>);
        }

        return (
            <div className={collapsed ? 'AppIconCategories' : 'AppIconCategories expanded'} onTransitionEnd={this.animationComplete}>
                {content}
            </div>
        ); 
    }

    render() {
        const {app} = this.props;
        const {collapsed} = this.state;

        if (!app.notifications_categories.length) {
            return null;
        }

        return (
            <div className={collapsed ? 'AppIconContainer' : 'AppIconContainer expanded'}>
                {this.renderCategories()}
                <button className={collapsed ? 'AppIcon' : 'AppIcon expanded'} onClick={this.handleClick}>
                    <i className={'fa fa-2x ' + app.icon} />
                    {this.renderBadge()} 
                </button>
            </div>
        );
    }
}
