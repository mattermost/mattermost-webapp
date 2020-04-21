// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage, IntlShape, injectIntl} from 'react-intl';

import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import OverlayTrigger from 'components/overlay_trigger';
import classNames from 'classnames';
import { ChannelCategory } from 'mattermost-redux/types/channel_categories';

import { CategoryTypes } from 'mattermost-redux/constants/channel_categories';

const MENU_BOTTOM_MARGIN = 80;

type Props = {
    category: ChannelCategory;
    //currentUserId: string;
    isMuted: boolean;
    intl: IntlShape;
    actions: {

    }
};

type State = {
    isMenuOpen: boolean;
    openUp: boolean;
    width: number;
};

class SidebarCategoryMenu extends React.PureComponent<Props, State> {
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

    unmuteCategory = () => {

    }

    muteCategory = () => {

    }

    deleteCategory = () => {

    }

    renameCategory = () => {

    }

    createCategory = () => {

    }

    createChannel = () => {

    }

    renderDropdownItems = () => {
        const {intl, isMuted, category} = this.props;

        // TODO: Add different translation for Direct Messages
        let muteCategory;
        if (isMuted) {
            muteCategory = (
                <Menu.ItemAction
                    id={`unmute-${category.id}`}
                    onClick={this.unmuteCategory}
                    icon={<i className='icon-bell-off-outline'/>}
                    text={intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.unmuteCategory', defaultMessage: 'Unmute Category'})}
                />
            );
        } else {
            muteCategory = (
                <Menu.ItemAction
                    id={`mute-${category.id}`}
                    onClick={this.muteCategory}
                    icon={<i className='icon-bell-outline'/>}
                    text={intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.muteCategory', defaultMessage: 'Mute Category'})}
                />
            );
        }

        let deleteCategory, renameCategory;
        if (category.type === CategoryTypes.CUSTOM) {
            deleteCategory = (
                <Menu.Group>
                    <Menu.ItemAction
                        id={`delete-${category.id}`}
                        onClick={this.deleteCategory}
                        icon={<i className='icon-bell-outline'/>}
                        text={intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.deleteCategory', defaultMessage: 'Delete Category'})}
                    />
                </Menu.Group>
            );

            renameCategory = (
                <Menu.ItemAction
                    id={`rename-${category.id}`}
                    onClick={this.renameCategory}
                    icon={<i className='icon-pencil-outline'/>}
                    text={intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.renameCategory', defaultMessage: 'Rename Category'})}
                />
            );
        }

        let createChannel;
        if (category.type !== CategoryTypes.FAVORITES) {
            createChannel = (
                <Menu.ItemAction
                    id={`createChannel-${category.id}`}
                    onClick={this.createChannel}
                    icon={<i className='icon-plus'/>}
                    text={intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.createChannel', defaultMessage: 'Create Channel'})}
                />
            );
        }

        return (
            <React.Fragment>
                <Menu.Group>
                    {muteCategory}
                    {renameCategory}
                    {createChannel}
                </Menu.Group>
                <Menu.Group>
                    <Menu.ItemAction
                        id={`create-${category.id}`}
                        onClick={this.createCategory}
                        icon={<i className='icon-folder-plus-outline'/>}
                        text={intl.formatMessage({id: 'sidebar_left.sidebar_category_menu.createCategory', defaultMessage: 'Create Category'})}
                    />
                </Menu.Group>
                {deleteCategory}
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
        const {intl, category} = this.props;

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
                    id={`SidebarCategoryMenu-${category.id}`}
                    ariaLabel={intl.formatMessage({id: 'sidebar_left.sidebar_channel_menu.dropdownAriaLabel', defaultMessage: 'Channel Menu'})}
                >
                    {this.renderDropdownItems()}
                </Menu>
            </MenuWrapper>
        );
    }
}

export default injectIntl(SidebarCategoryMenu);
