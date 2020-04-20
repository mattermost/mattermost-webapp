// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage, IntlShape, injectIntl} from 'react-intl';

import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import OverlayTrigger from 'components/overlay_trigger';
import { Channel, ChannelNotifyProps } from 'mattermost-redux/types/channels';
import classNames from 'classnames';
import { NotificationLevels, ModalIdentifiers } from 'utils/constants';
import { ChannelCategory } from 'mattermost-redux/types/channel_categories';

import ChannelInviteModal from 'components/channel_invite_modal';

const MENU_BOTTOM_MARGIN = 80;

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
    }
};

type State = {
    isMenuOpen: boolean;
    openUp: boolean;
    width: number;
};

class SidebarChannelMenu extends React.PureComponent<Props, State> {
    menuRef?: Menu;
    menuButtonRef: React.RefObject<HTMLButtonElement>;
    isLeaving: boolean;

    constructor(props: Props) {
        super(props);

        this.state = {
            isMenuOpen: false,
            openUp: false,
            width: 0,
        }

        this.menuButtonRef = React.createRef();
        this.isLeaving = false;
    }

    // TODO: Temporary code to keep the menu in place while scrolling
    componentDidMount() {
        const scrollbars = document.querySelectorAll('#SidebarContainer .SidebarNavContainer .scrollbar--view');
        if (scrollbars && scrollbars[0]) {
            scrollbars[0].addEventListener('scroll', this.setMenuPosition);
        }
    }

    componentWillUnmount() {
        const scrollbars = document.querySelectorAll('#SidebarContainer .SidebarNavContainer .scrollbar--view');
        if (scrollbars && scrollbars[0]) {
            scrollbars[0].removeEventListener('scroll', this.setMenuPosition);
        }
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
        const {channel} = this.props;

        const modalData = {
            modalId: ModalIdentifiers.CHANNEL_INVITE,
            dialogProps: ChannelInviteModal,
            dialogType: {channel},
        };

        this.props.actions.openModal(modalData);
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
            muteChannel = (
                <Menu.ItemAction
                    id={`unmute-${channel.id}`}
                    onClick={this.unmuteChannel}
                    icon={<i className='icon-bell-off-outline'/>}
                    text={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.unmuteChannel', defaultMessage: 'Unmute Channel'})}
                />
            );
        } else {
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
                icon: (<i className='icon-folder-outline'/>),
                direction: 'right' as any,
                text: category.display_name,
                onClick: this.moveToCategory(category.id),
            }
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
                        text={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.leave', defaultMessage: 'Leave Conversation'})}
                    />
                </Menu.Group>
            </React.Fragment>
        );
    }

    refCallback = (ref: Menu) => {
        if (ref) {
            this.menuRef = ref;

            const rect = ref.rect();
            const buttonRect = this.menuButtonRef.current?.getBoundingClientRect();
            const y = typeof buttonRect?.y === 'undefined' ? buttonRect?.top : buttonRect.y;
            const windowHeight = window.innerHeight;

            const totalSpace = windowHeight - MENU_BOTTOM_MARGIN;
            const spaceOnTop = y || 0;
            const spaceOnBottom = totalSpace - spaceOnTop;

            this.setState({
                openUp: (spaceOnTop > spaceOnBottom),
                width: rect?.width || 0,
            });
        }
    }

    setMenuPosition = () => {
        if (this.state.isMenuOpen && this.menuButtonRef.current && this.menuRef) {
            const menuRef = this.menuRef.node.current?.parentElement as HTMLDivElement;
            const openUpOffset = this.state.openUp ? -this.menuButtonRef.current.getBoundingClientRect().height : 0;
            menuRef.style.top = `${this.menuButtonRef.current.getBoundingClientRect().top + this.menuButtonRef.current.clientHeight + openUpOffset}px`;
        }
    }

    handleMenuToggle = (isMenuOpen: boolean) => {
        this.setState({isMenuOpen}, () => {
            this.setMenuPosition();
        });
    }

    render() {
        const {intl, channel} = this.props;

        const tooltip = (
            <Tooltip
                id='new-group-tooltip'
                className='hidden-xs'
            >
                <FormattedMessage
                    id={'sidebar_left.sidebar_channel_menu.editChannel'}
                    defaultMessage='Edit channel'
                />
            </Tooltip>
        );

        return (
            <MenuWrapper
                className={classNames('SidebarChannelMenu', {
                    menuOpen: this.state.isMenuOpen,
                })}
                onToggle={this.handleMenuToggle}
            >
                <button
                    ref={this.menuButtonRef}
                    className='SidebarChannelMenu_menuButton'
                    aria-label={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.dropdownAriaLabel', defaultMessage: 'Channel Menu'})}
                >
                    <OverlayTrigger
                        delayShow={500}
                        placement='top'
                        overlay={tooltip}
                    >
                        <i className='icon-dots-vertical'/>
                    </OverlayTrigger>
                </button>
                <Menu
                    ref={this.refCallback}
                    openUp={this.state.openUp}
                    id={`SidebarChannelMenu-${channel.id}`}
                    ariaLabel={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.dropdownAriaLabel', defaultMessage: 'Channel Menu'})}
                >
                    {this.renderDropdownItems()}
                </Menu>
            </MenuWrapper>
        );
    }
}

export default injectIntl(SidebarChannelMenu);
