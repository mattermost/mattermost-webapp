// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import {browserHistory} from 'utils/browser_history';
import {mark, trackEvent} from 'actions/diagnostics_actions.jsx';
import {isDesktopApp} from 'utils/user_agent.jsx';
import CopyUrlContextMenu from 'components/copy_url_context_menu';

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
            PropTypes.object,
        ]).isRequired,
        channelStatus: PropTypes.string,
        handleClose: PropTypes.func,
        hasDraft: PropTypes.bool.isRequired,
        badge: PropTypes.bool,
        membersCount: PropTypes.number.isRequired,
        unreadMentions: PropTypes.number,
        teammateId: PropTypes.string,
        teammateDeletedAt: PropTypes.number,
        channelIsArchived: PropTypes.bool.isRequired,
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

        const content = (
            <React.Fragment>
                <SidebarChannelButtonOrLinkIcon
                    channelStatus={this.props.channelStatus}
                    channelType={this.props.channelType}
                    channelIsArchived={this.props.channelIsArchived}
                    hasDraft={this.props.hasDraft}
                    membersCount={this.props.membersCount}
                    teammateId={this.props.teammateId}
                    teammateDeletedAt={this.props.teammateDeletedAt}
                />
                <span className='sidebar-item__name'>
                    <span>{this.props.displayName}</span>
                </span>
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
