// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {IntlShape, injectIntl} from 'react-intl';

import {CategoryTypes} from 'mattermost-redux/constants/channel_categories';
import {Channel, ChannelNotifyProps} from 'mattermost-redux/types/channels';
import {ChannelCategory} from 'mattermost-redux/types/channel_categories';

import SidebarMenu from 'components/sidebar/sidebar_menu';
import Menu from 'components/widgets/menu/menu';
import {NotificationLevels} from 'utils/constants';

type Props = {
    channel: Channel;
    categories: ChannelCategory[];
    currentUserId: string;
    isUnread: boolean;
    isFavorite: boolean;
    isMuted: boolean;
    intl: IntlShape;
    closeHandler?: (callback: () => void) => void;
    actions: {
        markChannelAsRead: (channelId: string) => void;
        favoriteChannel: (channelId: string) => void;
        unfavoriteChannel: (channelId: string) => void;
        updateChannelNotifyProps: (userId: string, channelId: string, props: ChannelNotifyProps) => void;
        openModal: (modalData: any) => void;
    };
};

type State = {
    openUp: boolean;
    width: number;
};

class SidebarChannelMenu extends React.PureComponent<Props, State> {
    isLeaving: boolean;

    constructor(props: Props) {
        super(props);

        this.state = {
            openUp: false,
            width: 0,
        };

        this.isLeaving = false;
    }

    markAsRead = () => {
        this.props.actions.markChannelAsRead(this.props.channel.id);
    }

    favoriteChannel = () => {
        this.props.actions.favoriteChannel(this.props.channel.id);
    }

    unfavoriteChannel = () => {
        this.props.actions.unfavoriteChannel(this.props.channel.id);
    }

    unmuteChannel = () => {
        this.props.actions.updateChannelNotifyProps(this.props.currentUserId, this.props.channel.id, {
            mark_unread: NotificationLevels.ALL,
        } as any);
    }

    muteChannel = () => {
        this.props.actions.updateChannelNotifyProps(this.props.currentUserId, this.props.channel.id, {
            mark_unread: NotificationLevels.MENTION,
        } as any);
    }

    moveToCategory = (categoryId: string) => {
        // TODO
    }

    copyLink = () => {
        // TODO
    }

    handleLeaveChannel = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.isLeaving || !this.props.closeHandler) {
            return;
        }

        this.isLeaving = true;

        this.props.closeHandler(() => {
            this.isLeaving = false;
        });
    }

    addMembers = () => {
        // TODO
    }

    renderDropdownItems = () => {
        const {intl, isUnread, isFavorite, isMuted, channel, categories} = this.props;

        let markAsRead;
        if (isUnread) {
            markAsRead = (
                <Menu.ItemAction
                    id={`markAsRead-${channel.id}`}
                    onClick={this.markAsRead}
                    icon={<i className='icon-menu'/>}
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

        // TODO: Add different translation for Direct Messages
        let muteChannel;
        if (isMuted) {
            let muteChannelText = intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.unmuteChannel', defaultMessage: 'Unmute Channel'});
            if (channel.type === 'D' || channel.type === 'G') {
                muteChannelText = intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.unmuteConversation', defaultMessage: 'Unmute Conversation'});
            }
            muteChannel = (
                <Menu.ItemAction
                    id={`unmute-${channel.id}`}
                    onClick={this.unmuteChannel}
                    icon={<i className='icon-bell-off-outline'/>}
                    text={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.unmuteChannel', defaultMessage: 'Unmute Channel'})}
                />
            );
        } else {
            let muteChannelText = intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.muteChannel', defaultMessage: 'Mute Channel'});
            if (channel.type === 'D' || channel.type === 'G') {
                muteChannelText = intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.muteConversation', defaultMessage: 'Mute Conversation'});
            }
            muteChannel = (
                <Menu.ItemAction
                    id={`mute-${channel.id}`}
                    onClick={this.muteChannel}
                    icon={<i className='icon-bell-outline'/>}
                    text={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.muteChannel', defaultMessage: 'Mute Channel'})}
                />
            );
        }

        // TODO: Filter out categories you can't move to
        // TODO: Add the move to new category button
        const categoryMenuItems = categories.map((category) => {
            return {
                id: `moveToCategory-${channel.id}-${category.id}`,
                icon: category.type === CategoryTypes.FAVORITES ? (<i className='icon-star-outline'/>) : (<i className='icon-folder-outline'/>),
                direction: 'right' as any,
                text: category.display_name,
                onClick: this.moveToCategory(category.id),
            };
        });

        let publicChannelGroup;
        if (channel.type !== 'D') {
            let copyLink;
            if (channel.type === 'O') {
                copyLink = (
                    <Menu.ItemAction
                        id={`copyLink-${channel.id}`}
                        onClick={this.copyLink}
                        icon={<i className='icon-link-variant'/>}
                        text={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.copyLink', defaultMessage: 'Copy Link'})}
                    />
                );
            }

            publicChannelGroup = (
                <Menu.Group>
                    {copyLink}
                    <Menu.ItemAction
                        id={`addMembers-${channel.id}`}
                        onClick={this.addMembers}
                        icon={<i className='icon-account-outline'/>}
                        text={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.addMembers', defaultMessage: 'Add Members'})}
                    />
                </Menu.Group>
            );
        }

        let leaveChannelText = intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.leaveChannel', defaultMessage: 'Leave Channel'});
        if (channel.type === 'D' || channel.type === 'G') {
            leaveChannelText = intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.leaveConversation', defaultMessage: 'Leave Conversation'});
        }

        return (
            <React.Fragment>
                <Menu.Group>
                    {markAsRead}
                    {favorite}
                    {muteChannel}
                </Menu.Group>
                <Menu.Group>
                    <Menu.ItemSubMenu
                        id={`moveTo-${channel.id}`}
                        subMenu={categoryMenuItems}
                        text={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.moveTo', defaultMessage: 'Move to'})}
                        icon={<i className='icon-folder-move-outline'/>}
                        direction='right'
                        openUp={this.state.openUp}
                        xOffset={this.state.width}
                    />
                </Menu.Group>
                {publicChannelGroup}
                <Menu.Group>
                    <Menu.ItemAction
                        id={`leave-${channel.id}`}
                        onClick={this.handleLeaveChannel}
                        icon={<i className='icon-close'/>}
                        text={leaveChannelText}
                    />
                </Menu.Group>
            </React.Fragment>
        );
    }

    refCallback = (ref: SidebarMenu) => {
        if (ref) {
            this.setState({
                openUp: ref.state.openUp,
                width: ref.state.width,
            });
        }
    }

    render() {
        const {intl, channel} = this.props;

        return (
            <SidebarMenu
                refCallback={this.refCallback}
                id={`SidebarChannelMenu-${channel.id}`}
                ariaLabel={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.dropdownAriaLabel', defaultMessage: 'Channel Menu'})}
                buttonAriaLabel={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.dropdownAriaLabel', defaultMessage: 'Channel Menu'})}
                tooltipText={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.editChannel', defaultMessage: 'Edit channel'})}
            >
                {this.renderDropdownItems()}
            </SidebarMenu>
        );
    }
}

export default injectIntl(SidebarChannelMenu);
