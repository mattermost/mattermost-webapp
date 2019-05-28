// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

import {browserHistory} from 'utils/browser_history';
import {mark, trackEvent} from 'actions/diagnostics_actions.jsx';
import {isDesktopApp} from 'utils/user_agent.jsx';
import Constants from 'utils/constants.jsx';
import CopyUrlContextMenu from 'components/copy_url_context_menu';

import SidebarChannelButtonOrLinkIcon from './sidebar_channel_button_or_link_icon.jsx';
import SidebarChannelButtonOrLinkCloseButton from './sidebar_channel_button_or_link_close_button.jsx';

export default class SidebarChannelButtonOrLink extends React.PureComponent {
    static propTypes = {
        link: PropTypes.string.isRequired,
        rowClass: PropTypes.string.isRequired,
        channelType: PropTypes.string.isRequired,
        channelId: PropTypes.string.isRequired,
        channelName: PropTypes.string.isRequired,
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
        teammateIsBot: PropTypes.bool,
        channelIsArchived: PropTypes.bool.isRequired,
    }

    overlayTriggerAttr = ['hover', 'focus']

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
            badge = (
                <span
                    id='unreadMentions'
                    className='badge'
                >
                    {this.props.unreadMentions}
                </span>
            );
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
                    teammateIsBot={this.props.teammateIsBot}
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
                <div>
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
                </div>
            );
        } else {
            element = (
                <Link
                    id={`sidebarItem_${this.props.channelName}`}
                    to={this.props.link}
                    className={this.props.rowClass}
                    onClick={this.trackChannelSelectedEvent}
                >
                    {content}
                </Link>
            );
        }

        if (this.props.channelType === Constants.GM_CHANNEL) {
            const displayNameToolTip = (
                <Tooltip
                    id='channel-displayname__tooltip'
                    style={style.channelTooltip}
                >
                    {this.props.displayName}
                </Tooltip>
            );
            element = (
                <OverlayTrigger
                    trigger={this.overlayTriggerAttr}
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='top'
                    overlay={displayNameToolTip}
                >
                    {element}
                </OverlayTrigger>
            );
        }
        return element;
    }
}

const style = {
    channelTooltip: {
        paddingLeft: '8px',
        maxWidth: '228px'},
};