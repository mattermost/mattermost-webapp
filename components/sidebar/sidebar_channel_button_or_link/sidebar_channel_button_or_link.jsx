// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {browserHistory, Link} from 'react-router';

import {mark, trackEvent} from 'actions/diagnostics_actions.jsx';
import {isDesktopApp} from 'utils/user_agent.jsx';

import SidebarChannelButtonOrLinkIcon from './sidebar_channel_button_or_link_icon.jsx';
import SidebarChannelButtonOrLinkCloseButton from './sidebar_channel_button_or_link_close_button.jsx';

export default class SidebarChannelButtonOrLink extends React.PureComponent {
    static propTypes = {
        link: PropTypes.string.isRequired,
        rowClass: PropTypes.string.isRequired,
        channelType: PropTypes.string.isRequired,
        channelId: PropTypes.string.isRequired,
        displayName: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object
        ]).isRequired,
        channelStatus: PropTypes.string,
        handleClose: PropTypes.func,
        badge: PropTypes.bool,
        membersCount: PropTypes.number.isRequired,
        unreadMentions: PropTypes.number,
        teammateId: PropTypes.string,
        teammateDeletedAt: PropTypes.number
    }

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
        let element;
        if (isDesktopApp()) {
            element = (
                <button
                    className={'btn btn-link ' + this.props.rowClass}
                    onClick={this.handleClick}
                >
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
                </button>
            );
        } else {
            element = (
                <Link
                    to={this.props.link}
                    className={this.props.rowClass}
                    onClick={this.trackChannelSelectedEvent}
                >
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
                </Link>
            );
        }

        return element;
    }
}
