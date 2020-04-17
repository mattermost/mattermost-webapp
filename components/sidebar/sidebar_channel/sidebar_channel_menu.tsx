// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage, IntlShape, injectIntl} from 'react-intl';

import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import OverlayTrigger from 'components/overlay_trigger';
import { Channel } from 'mattermost-redux/types/channels';
import classNames from 'classnames';

type Props = {
    channel: Channel;
    intl: IntlShape;
};

type State = {
    isMenuOpen: boolean;
};

class SidebarChannelMenu extends React.PureComponent<Props, State> {
    menuRef: React.RefObject<Menu>;
    menuButtonRef: React.RefObject<HTMLButtonElement>;

    constructor(props: Props) {
        super(props);

        this.state = {
            isMenuOpen: false,
        }

        this.menuRef = React.createRef();
        this.menuButtonRef = React.createRef();
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

    renderDropdownItems = () => {
        const {intl} = this.props;

        let joinPublicChannel;
            joinPublicChannel = (
                <Menu.ItemAction
                    id='showMoreChannels'
                    onClick={() => { console.log('a') }}
                    icon={<i className='icon-globe'/>}
                    text={intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.browseChannels', defaultMessage: 'Browse Channels'})}
                />
            );

        let createChannel;
            createChannel = (
                <Menu.ItemAction
                    id='showNewChannel'
                    onClick={() => { console.log('a') }}
                    icon={<i className='icon-plus'/>}
                    text={intl.formatMessage({id: 'sidebar_left.add_channel_dropdown.createNewChannel', defaultMessage: 'Create New Channel'})}
                />
            );

        return (
            <Menu.Group>
                {joinPublicChannel}
                {createChannel}
                <Menu.ItemSubMenu
                    id='subMenu1'
                    subMenu={[{
                        id: 'subMenuItem1',
                        icon: (<i className='icon-plus'/>),
                        text: 'Test Submenu Item',
                        direction: 'right',
                    }]}
                    text='Test Submenu'
                    direction='right'
                    xOffset={this.menuRef.current?.node.current?.clientWidth || 0}
                />
            </Menu.Group>
        );
    }

    setMenuPosition = () => {
        if (this.state.isMenuOpen && this.menuButtonRef.current && this.menuRef.current) {
            const menuRef = this.menuRef.current.node.current?.parentElement as HTMLDivElement;
            menuRef.style.top = `${this.menuButtonRef.current.getBoundingClientRect().top + this.menuButtonRef.current.clientHeight}px`;
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
                        <i className='icon-plus'/>
                    </OverlayTrigger>
                </button>
                <Menu
                    ref={this.menuRef}
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
