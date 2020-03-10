// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {Link} from 'react-router-dom';

import {Channel} from 'mattermost-redux/types/channels';

import CopyUrlContextMenu from 'components/copy_url_context_menu/copy_url_context_menu';
import OverlayTrigger from 'components/overlay_trigger';

import {mark, trackEvent} from 'actions/diagnostics_actions';
import {localizeMessage} from 'utils/utils';
import {isDesktopApp} from 'utils/user_agent';
import Constants from 'utils/constants';
import {browserHistory} from 'utils/browser_history';

import ChannelMentionBadge from '../channel_mention_badge/';
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
};

type State = {
    showTooltip: boolean;
};

export default class SidebarChannelLink extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            showTooltip: false,
        };
    }

    // TODO: Gotta rethink some of this
    // componentDidMount() {
    //     this.enableToolTipIfNeeded();
    // }

    // componentDidUpdate(prevProps) {
    //     if (prevProps.displayName !== this.props.displayName) {
    //         this.enableToolTipIfNeeded();
    //     }
    // }

    // enableToolTipIfNeeded = () => {
    //     const element = this.displayNameRef.current;
    //     if (element && element.offsetWidth < element.scrollWidth) {
    //         this.setState({showTooltip: true});
    //     } else {
    //         this.setState({showTooltip: false});
    //     }
    // }

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

    trackChannelSelectedEvent = () => {
        mark('SidebarChannelLink#click');
        trackEvent('ui', 'ui_channel_selected');
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

    getRowClass = () => {
        // let rowClass = 'sidebar-item';
        // let badge = false;
        // if (this.showChannelAsUnread()) {
        //     rowClass += ' unread-title';
        // }

        // if (this.props.unreadMentions > 0) {
        //     rowClass += ' has-badge';

        //     badge = true;
        // }

        // if (this.props.channelMuted) {
        //     rowClass += ' muted';
        // }

        // if (closeHandler && !badge) {
        //     rowClass += ' has-close';
        // }
    }

    render() {
        const {link, label, channel, unreadMentions, icon} = this.props;

        const content = (
            <React.Fragment>
                <SidebarChannelIcon
                    channel={channel}
                    icon={icon}
                />
                <span className='SidebarChannelLinkLabel'>{label}</span>
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
        if (isDesktopApp()) {
            element = (
                <CopyUrlContextMenu
                    link={this.props.link}
                    menuId={channel.id}
                >
                    <button
                        className={'btn btn-link SidebarLink'}// TODO + rowClass}
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
                    className={'SidebarLink'}
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
                <Tooltip
                    id='channel-displayname__tooltip'

                    //style={style.channelTooltip} // TODO
                >
                    {label}
                </Tooltip>
            );
            element = (
                <OverlayTrigger
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
