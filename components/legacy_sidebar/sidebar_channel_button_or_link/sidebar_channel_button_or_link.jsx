// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {Tooltip} from 'react-bootstrap';

import {localizeMessage} from 'utils/utils.jsx';
import {browserHistory} from 'utils/browser_history';
import {mark, trackEvent} from 'actions/telemetry_actions.jsx';
import {isDesktopApp} from 'utils/user_agent';
import Constants from 'utils/constants';
import CopyUrlContextMenu from 'components/copy_url_context_menu';
import OverlayTrigger from 'components/overlay_trigger';

import SidebarChannelButtonOrLinkIcon from './sidebar_channel_button_or_link_icon.jsx';
import SidebarChannelButtonOrLinkCloseButton from './sidebar_channel_button_or_link_close_button.jsx';

export default class SidebarChannelButtonOrLink extends React.PureComponent {
    static propTypes = {
        link: PropTypes.string.isRequired,
        rowClass: PropTypes.string.isRequired,
        channelType: PropTypes.string.isRequired,
        channelId: PropTypes.string.isRequired,
        channelName: PropTypes.string.isRequired,
        displayName: PropTypes.string.isRequired,
        botIconUrl: PropTypes.string,
        channelStatus: PropTypes.string,
        handleClose: PropTypes.func,
        hasDraft: PropTypes.bool.isRequired,
        badge: PropTypes.bool,
        membersCount: PropTypes.number.isRequired,
        showUnreadForMsgs: PropTypes.bool.isRequired,
        unreadMsgs: PropTypes.number.isRequired,
        unreadMentions: PropTypes.number.isRequired,
        teammateId: PropTypes.string,
        teammateDeletedAt: PropTypes.number,
        teammateIsBot: PropTypes.bool,
        channelIsArchived: PropTypes.bool.isRequired,
    }

    constructor(props) {
        super(props);
        this.gmItemRef = React.createRef();
        this.displayNameRef = React.createRef();
    }

    state = {
        showTooltip: false,
    }

    componentDidMount() {
        this.enableToolTipIfNeeded();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.displayName !== this.props.displayName) {
            this.enableToolTipIfNeeded();
        }
    }

    enableToolTipIfNeeded = () => {
        const element = this.displayNameRef.current;
        if (element && element.offsetWidth < element.scrollWidth) {
            this.setState({showTooltip: true});
        } else {
            this.setState({showTooltip: false});
        }
    }

    trackChannelSelectedEvent = () => {
        mark('SidebarChannelLink#click');
        trackEvent('ui', 'ui_channel_selected');
    }

    handleClick = () => {
        this.trackChannelSelectedEvent();
        browserHistory.push(this.props.link);
    }

    removeTooltipLink = () => {
        // Bootstrap adds the attr dynamically, removing it to prevent a11y readout
        this.gmItemRef.current.removeAttribute('aria-describedby');
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
                    botIconUrl={this.props.botIconUrl}
                    channelIsArchived={this.props.channelIsArchived}
                    hasDraft={this.props.hasDraft}
                    membersCount={this.props.membersCount}
                    teammateId={this.props.teammateId}
                    teammateDeletedAt={this.props.teammateDeletedAt}
                    teammateIsBot={this.props.teammateIsBot}
                />
                <span className='sidebar-item__name'>
                    <span ref={this.displayNameRef}>
                        {this.props.displayName}
                    </span>
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
        let ariaLabel = this.props.displayName;

        if (this.props.channelType === Constants.OPEN_CHANNEL) {
            ariaLabel += ` ${localizeMessage('accessibility.sidebar.types.public', 'public channel')}`;
        } else if (this.props.channelType === Constants.PRIVATE_CHANNEL) {
            ariaLabel += ` ${localizeMessage('accessibility.sidebar.types.private', 'private channel')}`;
        }

        if (this.props.unreadMentions === 1) {
            ariaLabel += ` ${this.props.unreadMentions} ${localizeMessage('accessibility.sidebar.types.mention', 'mention')}`;
        } else if (this.props.unreadMentions > 1) {
            ariaLabel += ` ${this.props.unreadMentions} ${localizeMessage('accessibility.sidebar.types.mentions', 'mentions')}`;
        }

        if (this.props.unreadMsgs > 0 && this.props.showUnreadForMsgs && this.props.unreadMentions === 0) {
            ariaLabel += ` ${localizeMessage('accessibility.sidebar.types.unread', 'unread')}`;
        }

        ariaLabel = ariaLabel.toLowerCase();

        if (isDesktopApp()) {
            element = (
                <div>
                    <CopyUrlContextMenu
                        link={this.props.link}
                        menuId={this.props.channelId}
                    >
                        <button
                            className={'btn btn-link ' + this.props.rowClass}
                            aria-label={ariaLabel}
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
                    aria-label={ariaLabel}
                    to={this.props.link}
                    className={this.props.rowClass}
                    onClick={this.trackChannelSelectedEvent}
                >
                    {content}
                </Link>
            );
        }

        if (this.state.showTooltip) {
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
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='top'
                    overlay={displayNameToolTip}
                    onEntering={this.removeTooltipLink}
                >
                    <div ref={this.gmItemRef}>
                        {element}
                    </div>
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
