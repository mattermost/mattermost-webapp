// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.
// @flow

import React from 'react';
import {Link} from 'react-router-dom';

import {browserHistory} from 'utils/browser_history';
import {mark, trackEvent} from 'actions/diagnostics_actions.jsx';
import {isDesktopApp} from 'utils/user_agent.jsx';
import CopyUrlContextMenu from 'components/copy_url_context_menu';

import SidebarChannelButtonOrLinkIcon from './sidebar_channel_button_or_link_icon.jsx';
import SidebarChannelButtonOrLinkCloseButton from './sidebar_channel_button_or_link_close_button.jsx';

type Props = {
    link: string,
    rowClass: string,
    channelId: string,
    channelStatus?: string,
    channelType: string,
    displayName: string | Object,
    handleClose?: () => void,
    badge: boolean,
    unreadMentions?: number,
    membersCount: number,
    teammateId?: string,
    teammateDeletedAt?: number,
}

export default class SidebarChannelButtonOrLink extends React.PureComponent<Props> {
    props: Props;

    trackChannelSelectedEvent = () => {
        mark('SidebarChannelLink#click');
        trackEvent('ui', 'ui_channel_selected');
    }

    handleClick = () => {
        this.trackChannelSelectedEvent();
        browserHistory.push(this.props.link);
    }

    render = () => {
        let badge = null;
        if (this.props.badge) {
            badge = <span className='badge'>{this.props.unreadMentions}</span>;
        }

        const content = (
            <React.Fragment>
                <SidebarChannelButtonOrLinkIcon
                    channelId={this.props.channelId}
                    channelStatus={this.props.channelStatus}
                    channelType={this.props.channelType}
                    membersCount={this.props.membersCount}
                    teammateId={this.props.teammateId}
                    teammateDeletedAt={this.props.teammateDeletedAt}
                />
                <span className='sidebar-item__name'>{this.props.displayName}</span>
                {badge}
                <SidebarChannelButtonOrLinkCloseButton
                    handleClose={this.props.handleClose}
                    channelId={this.props.channelId}
                    channelType={this.props.channelType}
                    teammateId={this.props.teammateId}
                    badge={this.props.badge}
                />
            </React.Fragment>
        );

        let element;
        if (isDesktopApp()) {
            element = (
                <CopyUrlContextMenu
                    link={this.props.link}
                    menuId={this.props.channelId}
                >
                    <button
                        className={'btn btn-link ' + this.props.rowClass}
                        onClick={this.handleClick}
                    >
                        {content}
                    </button>
                </CopyUrlContextMenu>
            );
        } else {
            element = (
                <Link
                    to={this.props.link}
                    className={this.props.rowClass}
                    onClick={this.trackChannelSelectedEvent}
                >
                    {content}
                </Link>
            );
        }

        return element;
    }
}
