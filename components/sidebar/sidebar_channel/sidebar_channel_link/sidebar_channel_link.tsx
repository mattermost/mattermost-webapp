// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import classNames from 'classnames';

import {Channel} from 'mattermost-redux/types/channels';

import {mark, trackEvent} from 'actions/telemetry_actions';

import CopyUrlContextMenu from 'components/copy_url_context_menu';
import OverlayTrigger from 'components/overlay_trigger';

import Constants from 'utils/constants';
import {wrapEmojis} from 'utils/emoji_utils';
import {isDesktopApp} from 'utils/user_agent';
import {cmdOrCtrlPressed, localizeMessage} from 'utils/utils';

import ChannelMentionBadge from '../channel_mention_badge';
import SidebarChannelIcon from '../sidebar_channel_icon';
import SidebarChannelMenu from '../sidebar_channel_menu';
import CustomStatusEmoji from 'components/custom_status/custom_status_emoji';

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

    /**
     * Checks if channel is collapsed
     */
    isCollapsed: boolean;

    isChannelSelected: boolean;

    teammateId?: string;

    actions: {
        clearChannelSelection: () => void;
        multiSelectChannelTo: (channelId: string) => void;
        multiSelectChannelAdd: (channelId: string) => void;
    };
};

type State = {
    isMenuOpen: boolean;
    showTooltip: boolean;
};

export default class SidebarChannelLink extends React.PureComponent<Props, State> {
    labelRef: React.RefObject<HTMLDivElement>;
    gmItemRef: React.RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);

        this.labelRef = React.createRef();
        this.gmItemRef = React.createRef();

        this.state = {
            isMenuOpen: false,
            showTooltip: false,
        };
    }

    componentDidMount(): void {
        this.enableToolTipIfNeeded();
    }

    componentDidUpdate(prevProps: Props): void {
        if (prevProps.label !== this.props.label) {
            this.enableToolTipIfNeeded();
        }
    }

    enableToolTipIfNeeded = (): void => {
        const element = this.gmItemRef.current || this.labelRef.current;
        const showTooltip = element && element.offsetWidth < element.scrollWidth;
        this.setState({showTooltip: Boolean(showTooltip)});
    }

    getAriaLabel = (): string => {
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

    // Bootstrap adds the attr dynamically, removing it to prevent a11y readout
    removeTooltipLink = (): void => this.gmItemRef.current?.removeAttribute?.('aria-describedby');

    handleChannelClick = (event: React.MouseEvent<HTMLAnchorElement>): void => {
        mark('SidebarLink#click');
        trackEvent('ui', 'ui_channel_selected_v2');

        this.handleSelectChannel(event);
    }

    handleSelectChannel = (event: React.MouseEvent<HTMLAnchorElement>): void => {
        if (event.defaultPrevented || event.button !== 0) {
            return;
        }

        if (cmdOrCtrlPressed(event)) {
            event.preventDefault();
            this.props.actions.multiSelectChannelAdd(this.props.channel.id);
        } else if (event.shiftKey) {
            event.preventDefault();
            this.props.actions.multiSelectChannelTo(this.props.channel.id);
        } else {
            this.props.actions.clearChannelSelection();
        }
    }

    handleMenuToggle = (isMenuOpen: boolean): void => this.setState({isMenuOpen});

    /**
     * Show as unread if you have unread mentions
     * OR if you have unread messages and the channel can be marked unread by preferences
     */
    showChannelAsUnread = (): boolean => this.props.unreadMentions > 0 || (this.props.unreadMsgs > 0 && this.props.showUnreadForMsgs);

    render(): JSX.Element {
        const {link, label, channel, unreadMentions, icon, isMuted, isChannelSelected} = this.props;

        let labelElement: JSX.Element = (
            <span
                className={classNames(
                    'SidebarChannelLinkLabel',
                    {
                        truncated: this.state.showTooltip,
                    },
                )}
            >
                {wrapEmojis(label)}
            </span>
        );
        if (this.state.showTooltip) {
            const displayNameToolTip = (
                <Tooltip id='channel-displayname__tooltip'>
                    {label}
                </Tooltip>
            );
            labelElement = (
                <OverlayTrigger
                    delayShow={Constants.OVERLAY_TIME_DELAY}
                    placement='top'
                    overlay={displayNameToolTip}
                    onEntering={this.removeTooltipLink}
                >
                    <div ref={this.gmItemRef}>
                        {labelElement}
                    </div>
                </OverlayTrigger>
            );
        }

        const customStatus = this.props.teammateId ? (
            <CustomStatusEmoji
                userID={this.props.teammateId}
                showTooltip={true}
                spanStyle={{
                    height: 18,
                }}
                emojiStyle={{
                    marginTop: -4,
                    marginLeft: 6,
                    marginBottom: 0,
                }}
            />
        ) : null;

        const content = (
            <>
                <SidebarChannelIcon
                    channel={channel}
                    icon={icon}
                />
                <div
                    className='SidebarChannelLinkLabel_wrapper'
                    ref={this.labelRef}
                >
                    {labelElement}
                    {customStatus}
                </div>
                <ChannelMentionBadge
                    channelId={channel.id}
                    unreadMentions={unreadMentions}
                />
                <SidebarChannelMenu
                    channel={channel}
                    isUnread={this.showChannelAsUnread()}
                    isCollapsed={this.props.isCollapsed}
                    closeHandler={this.props.closeHandler}
                    channelLink={link}
                    isMenuOpen={this.state.isMenuOpen}
                    onToggleMenu={this.handleMenuToggle}
                />
            </>
        );

        // NOTE: class added to temporarily support the desktop app's at-mention DOM scraping of the old sidebar
        const className = classNames([
            'SidebarLink',
            {
                menuOpen: this.state.isMenuOpen,
                muted: isMuted,
                'unread-title': this.showChannelAsUnread(),
                selected: isChannelSelected,
            },
        ]);
        let element = (
            <Link
                className={className}
                id={`sidebarItem_${channel.name}`}
                aria-label={this.getAriaLabel()}
                to={link}
                onClick={this.handleChannelClick}
                tabIndex={this.props.isCollapsed ? -1 : 0}
            >
                {content}
            </Link>
        );

        if (isDesktopApp()) {
            element = (
                <CopyUrlContextMenu
                    link={this.props.link}
                    menuId={channel.id}
                >
                    {element}
                </CopyUrlContextMenu>
            );
        }

        return element;
    }
}
