// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import classNames from 'classnames';

import {Channel} from 'mattermost-redux/types/channels';

import CopyUrlContextMenu from 'components/copy_url_context_menu';
import OverlayTrigger from 'components/overlay_trigger';

import {mark, trackEvent} from 'actions/diagnostics_actions';
import {localizeMessage} from 'utils/utils';
import {isDesktopApp} from 'utils/user_agent';
import Constants from 'utils/constants';
import {browserHistory} from 'utils/browser_history';

import ChannelMentionBadge from '../channel_mention_badge';
import SidebarChannelClose from '../sidebar_channel_close';
import SidebarChannelIcon from '../sidebar_channel_icon';

type Props = {
    channel: Channel;
    link: string;
    label: string;
    ariaLabelPrefix?: string;
    closeHandler?: (callback: () => void) => void;
    icon: JSX.Element | null;

    /**
     * Number of unread mentions in this channel
     */
    unreadMentions: number;

    /**
     * Number of unread messages in this channel
     */
    unreadMsgs: number;

    /**
     * User preference of whether the channel can be marked unread
     */
    showUnreadForMsgs: boolean;

    /**
     * Checks if the current channel is muted
     */
    isMuted: boolean;
};

type State = {
    showTooltip: boolean;
};

export default class SidebarChannelLink extends React.PureComponent<Props, State> {
    labelRef: React.RefObject<HTMLSpanElement>;
    gmItemRef: React.RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);

        this.labelRef = React.createRef();
        this.gmItemRef = React.createRef();

        this.state = {
            showTooltip: false,
        };
    }

    componentDidMount() {
        this.enableToolTipIfNeeded();
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.label !== this.props.label) {
            this.enableToolTipIfNeeded();
        }
    }

    // TODO: Is there a better way to do this?
    enableToolTipIfNeeded = () => {
        const element = this.labelRef.current;
        if (element && element.offsetWidth < element.scrollWidth) {
            this.setState({showTooltip: true});
        } else {
            this.setState({showTooltip: false});
        }
    }

    getAriaLabel = () => {
        const {label, ariaLabelPrefix, unreadMentions} = this.props;

        let ariaLabel = label;

        if (ariaLabelPrefix) {
            ariaLabel += ` ${ariaLabelPrefix}`;
        }

        if (unreadMentions === 1) {
            ariaLabel += ` ${unreadMentions} ${localizeMessage('accessibility.sidebar.types.mention', 'mention')}`;
        } else if (unreadMentions > 1) {
            ariaLabel += ` ${unreadMentions} ${localizeMessage('accessibility.sidebar.types.mentions', 'mentions')}`;
        }

        if (this.showChannelAsUnread() && unreadMentions === 0) {
            ariaLabel += ` ${localizeMessage('accessibility.sidebar.types.unread', 'unread')}`;
        }

        return ariaLabel.toLowerCase();
    }

    removeTooltipLink = () => {
        // Bootstrap adds the attr dynamically, removing it to prevent a11y readout
        if (this.gmItemRef.current) {
            this.gmItemRef.current.removeAttribute('aria-describedby');
        }
    }

    trackChannelSelectedEvent = () => {
        mark('SidebarLink#click');
        trackEvent('ui', 'ui_channel_selected_v2');
    }

    handleClick = () => {
        this.trackChannelSelectedEvent();
        browserHistory.push(this.props.link);
    }

    /**
     * Show as unread if you have unread mentions
     * OR if you have unread messages and the channel can be marked unread by preferences
     */
    showChannelAsUnread = () => {
        return this.props.unreadMentions > 0 || (this.props.unreadMsgs > 0 && this.props.showUnreadForMsgs);
    };

    render() {
        const {link, label, channel, unreadMentions, icon, isMuted} = this.props;
        const content = (
            <React.Fragment>
                <SidebarChannelIcon
                    channel={channel}
                    icon={icon}
                />
                <span
                    className={'SidebarChannelLinkLabel'}
                    ref={this.labelRef}
                >
                    {label}
                </span>
                <ChannelMentionBadge
                    channelId={channel.id}
                    unreadMentions={unreadMentions}
                />
                <SidebarChannelClose
                    channel={channel}
                    show={!this.showChannelAsUnread()}
                    closeHandler={this.props.closeHandler}
                />
            </React.Fragment>
        );

        let element;

        // NOTE: class added to temporarily support the desktop app's at-mention DOM scraping of the old sidebar
        const oldUnreadClass = this.showChannelAsUnread() ? 'unread-title' : '';
        if (isDesktopApp()) {
            element = (
                <CopyUrlContextMenu
                    link={this.props.link}
                    menuId={channel.id}
                >
                    <button
                        className={classNames(['btn btn-link SidebarLink', {muted: isMuted}, oldUnreadClass])}
                        aria-label={this.getAriaLabel()}
                        onClick={this.handleClick}
                    >
                        {content}
                    </button>
                </CopyUrlContextMenu>
            );
        } else {
            element = (
                <Link
                    className={classNames(['SidebarLink', {muted: isMuted}, oldUnreadClass])}
                    id={`sidebarItem_${channel.name}`}
                    aria-label={this.getAriaLabel()}
                    to={link}
                    onClick={this.trackChannelSelectedEvent}
                >
                    {content}
                </Link>
            );
        }

        if (this.state.showTooltip) {
            const displayNameToolTip = (
                <Tooltip id='channel-displayname__tooltip'>
                    {label}
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
