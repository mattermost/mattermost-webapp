// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {IntlShape, injectIntl} from 'react-intl';

import {Channel} from 'mattermost-redux/types/channels';

import {trackEvent} from 'actions/telemetry_actions';

import CategoryMenuItems from 'components/category_menu_items';
import ChannelInviteModal from 'components/channel_invite_modal';
import SidebarMenu from 'components/sidebar/sidebar_menu';
import Menu from 'components/widgets/menu/menu';

import {ModalData} from 'types/actions';

import Constants, {ModalIdentifiers} from 'utils/constants';
import {copyToClipboard} from 'utils/utils';

type Props = {
    channel: Channel;
    channelLink: string;
    currentUserId: string;
    currentTeamId: string;
    isUnread: boolean;
    isFavorite: boolean;
    isMuted: boolean;
    intl: IntlShape;
    managePublicChannelMembers: boolean;
    managePrivateChannelMembers: boolean;
    closeHandler?: (callback: () => void) => void;
    isCollapsed: boolean;
    isMenuOpen: boolean;
    onToggleMenu: (isMenuOpen: boolean) => void;
    actions: {
        markChannelAsRead: (channelId: string) => void;
        favoriteChannel: (channelId: string) => void;
        unfavoriteChannel: (channelId: string) => void;
        muteChannel: (userId: string, channelId: string) => void;
        unmuteChannel: (userId: string, channelId: string) => void;
        openModal: <P>(modalData: ModalData<P>) => void;
    };
};

type State = {
    openUp: boolean;
};

export class SidebarChannelMenu extends React.PureComponent<Props, State> {
    isLeaving: boolean;

    constructor(props: Props) {
        super(props);

        this.state = {
            openUp: false,
        };

        this.isLeaving = false;
    }

    markAsRead = () => {
        this.props.actions.markChannelAsRead(this.props.channel.id);
        trackEvent('ui', 'ui_sidebar_channel_menu_markAsRead');
    }

    favoriteChannel = () => {
        this.props.actions.favoriteChannel(this.props.channel.id);
        trackEvent('ui', 'ui_sidebar_channel_menu_favorite');
    }

    unfavoriteChannel = () => {
        this.props.actions.unfavoriteChannel(this.props.channel.id);
        trackEvent('ui', 'ui_sidebar_channel_menu_unfavorite');
    }

    unmuteChannel = () => {
        this.props.actions.unmuteChannel(this.props.currentUserId, this.props.channel.id);
    }

    muteChannel = () => {
        this.props.actions.muteChannel(this.props.currentUserId, this.props.channel.id);
    }

    copyLink = () => {
        copyToClipboard(this.props.channelLink);
    }

    handleLeaveChannel = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.isLeaving || !this.props.closeHandler) {
            return;
        }

        this.isLeaving = true;
        trackEvent('ui', 'ui_sidebar_channel_menu_leave');

        this.props.closeHandler(() => {
            this.isLeaving = false;
        });
    }

    addMembers = () => {
        const {channel, actions} = this.props;

        actions.openModal({
            modalId: ModalIdentifiers.CHANNEL_INVITE,
            dialogType: ChannelInviteModal,
            dialogProps: {channel},
        });
        trackEvent('ui', 'ui_sidebar_channel_menu_addMembers');
    }

    renderDropdownItems = () => {
        const {intl, isUnread, isFavorite, isMuted, channel} = this.props;

        let markAsRead;
        if (isUnread) {
            markAsRead = (
                <Menu.ItemAction
                    id={`markAsRead-${channel.id}`}
                    onClick={this.markAsRead}
                    icon={<i className='icon-mark-as-unread'/>}
                    text={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.markAsRead', defaultMessage: 'Mark as Read'})}
                />
            );
        }

        let favorite;
        if (isFavorite) {
            favorite = (
                <Menu.ItemAction
                    id={`unfavorite-${channel.id}`}
                    onClick={this.unfavoriteChannel}
                    icon={<i className='icon-star'/>}
                    text={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.unfavoriteChannel', defaultMessage: 'Unfavorite'})}
                />
            );
        } else {
            favorite = (
                <Menu.ItemAction
                    id={`favorite-${channel.id}`}
                    onClick={this.favoriteChannel}
                    icon={<i className='icon-star-outline'/>}
                    text={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.favoriteChannel', defaultMessage: 'Favorite'})}
                />
            );
        }

        let muteChannel;
        if (isMuted) {
            let muteChannelText = intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.unmuteChannel', defaultMessage: 'Unmute Channel'});
            if (channel.type === Constants.DM_CHANNEL || channel.type === Constants.GM_CHANNEL) {
                muteChannelText = intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.unmuteConversation', defaultMessage: 'Unmute Conversation'});
            }
            muteChannel = (
                <Menu.ItemAction
                    id={`unmute-${channel.id}`}
                    onClick={this.unmuteChannel}
                    icon={<i className='icon-bell-off-outline'/>}
                    text={muteChannelText}
                />
            );
        } else {
            let muteChannelText = intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.muteChannel', defaultMessage: 'Mute Channel'});
            if (channel.type === Constants.DM_CHANNEL || channel.type === Constants.GM_CHANNEL) {
                muteChannelText = intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.muteConversation', defaultMessage: 'Mute Conversation'});
            }
            muteChannel = (
                <Menu.ItemAction
                    id={`mute-${channel.id}`}
                    onClick={this.muteChannel}
                    icon={<i className='icon-bell-outline'/>}
                    text={muteChannelText}
                />
            );
        }

        let copyLink;
        if (channel.type === Constants.OPEN_CHANNEL || channel.type === Constants.PRIVATE_CHANNEL) {
            copyLink = (
                <Menu.ItemAction
                    id={`copyLink-${channel.id}`}
                    onClick={this.copyLink}
                    icon={<i className='icon-link-variant'/>}
                    text={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.copyLink', defaultMessage: 'Copy Link'})}
                />
            );
        }

        let addMembers;
        if ((channel.type === Constants.PRIVATE_CHANNEL && this.props.managePrivateChannelMembers) || (channel.type === Constants.OPEN_CHANNEL && this.props.managePublicChannelMembers)) {
            addMembers = (
                <Menu.ItemAction
                    id={`addMembers-${channel.id}`}
                    onClick={this.addMembers}
                    icon={<i className='icon-account-outline'/>}
                    text={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.addMembers', defaultMessage: 'Add Members'})}
                />
            );
        }

        let leaveChannelText = intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.leaveChannel', defaultMessage: 'Leave Channel'});
        if (channel.type === Constants.DM_CHANNEL || channel.type === Constants.GM_CHANNEL) {
            leaveChannelText = intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.leaveConversation', defaultMessage: 'Close Conversation'});
        }

        let leaveChannel;
        if (channel.name !== Constants.DEFAULT_CHANNEL) {
            leaveChannel = (
                <Menu.Group>
                    <Menu.ItemAction
                        id={`leave-${channel.id}`}
                        onClick={this.handleLeaveChannel}
                        icon={<i className='icon-close'/>}
                        text={leaveChannelText}
                    />
                </Menu.Group>
            );
        }

        return (
            <React.Fragment>
                <Menu.Group>
                    {markAsRead}
                    {favorite}
                    {muteChannel}
                </Menu.Group>
                <CategoryMenuItems
                    channel={channel}
                    openUp={this.state.openUp}
                    location={'sidebar'}
                />
                <Menu.Group>
                    {copyLink}
                    {addMembers}
                </Menu.Group>
                {leaveChannel}
            </React.Fragment>
        );
    }

    handleOpenDirectionChange = (openUp: boolean) => {
        this.setState({
            openUp,
        });
    }

    onToggleMenu = (open: boolean) => {
        this.props.onToggleMenu(open);

        if (open) {
            trackEvent('ui', 'ui_sidebar_channel_menu_opened');
        }
    }

    render() {
        const {
            channel,
            intl,
            isCollapsed,
            isMenuOpen,
        } = this.props;

        return (
            <SidebarMenu
                id={`SidebarChannelMenu-${channel.id}`}
                ariaLabel={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.dropdownAriaLabel', defaultMessage: 'Channel Menu'})}
                buttonAriaLabel={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.dropdownAriaLabel', defaultMessage: 'Channel Menu'})}
                isMenuOpen={isMenuOpen}
                onOpenDirectionChange={this.handleOpenDirectionChange}
                onToggleMenu={this.onToggleMenu}
                tooltipText={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.editChannel', defaultMessage: 'Channel options'})}
                tabIndex={isCollapsed ? -1 : 0}
            >
                {isMenuOpen && this.renderDropdownItems()}
            </SidebarMenu>
        );
    }
}

export default injectIntl(SidebarChannelMenu);
