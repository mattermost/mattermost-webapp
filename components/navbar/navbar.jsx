// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import NotifyCounts from 'components/notify_counts.jsx';
import MenuIcon from 'components/svg/menu_icon';

import MobileChannelHeaderPlug from 'plugins/mobile_channel_header_plug';

import {MobileChannelHeaderDropdown} from 'components/channel_header_dropdown';

import NavbarInfoButton from './navbar_info_button';
import ShowSearchButton from './show_search_button';

export default class Navbar extends React.PureComponent {
    static propTypes = {

        /**
         * Object with info about current user
         */
        currentUser: PropTypes.object.isRequired,

        /**
         * Object with info about current channel
         */
        channel: PropTypes.object,

        /**
         * Bool whether the current channel is read only
         */
        isReadOnly: PropTypes.bool,

        /**
         * Object with action creators
         */
        actions: PropTypes.shape({
            showPinnedPosts: PropTypes.func.isRequired,
            toggleLhs: PropTypes.func.isRequired,
            closeLhs: PropTypes.func.isRequired,
            closeRhs: PropTypes.func.isRequired,
            closeRhsMenu: PropTypes.func.isRequired,
        }).isRequired,
    };

    componentDidMount() {
        $('.inner-wrap').on('click', this.hideSidebars);
    }

    componentWillUnmount() {
        $('.inner-wrap').off('click', this.hideSidebars);
    }

    hideSidebars = (e) => {
        var windowWidth = $(window).outerWidth();
        if (windowWidth <= 768) {
            this.props.actions.closeRhs();

            if (e.target.className !== 'navbar-toggle' && e.target.className !== 'icon-bar') {
                this.props.actions.closeLhs();
                this.props.actions.closeRhs();
                this.props.actions.closeRhsMenu();
            }
        }
    }

    toggleLeftSidebar = () => {
        this.props.actions.toggleLhs();
    }

    toggleRightSidebar = () => {
        this.props.actions.toggleRhsMenu();
    }

    hideHeaderOverlay = () => {
        if (this.refs.headerOverlay) {
            this.refs.headerOverlay.hide();
        }
    }

    createCollapseButtons = (currentId) => {
        var buttons = [];

        if (currentId == null) {
            lhsButton = (
                <button
                    key='navbar-toggle-collapse'
                    type='button'
                    className='navbar-toggle'
                    data-toggle='collapse'
                    data-target='#navbar-collapse-1'
                >
                    <span className='sr-only'>
                        <FormattedMessage
                            id='navbar.toggle1'
                            defaultMessage='Toggle sidebar'
                        />
                    </span>
                    <span className='icon-bar'/>
                    <span className='icon-bar'/>
                    <span className='icon-bar'/>
                </button>
            );
        } else {
            lhsButton = (
                <button
                    key='navbar-toggle-sidebar'
                    type='button'
                    className='navbar-toggle'
                    data-toggle='collapse'
                    data-target='#sidebar-nav'
                    onClick={this.toggleLeftSidebar}
                >
                    <span className='sr-only'>
                        <FormattedMessage
                            id='navbar.toggle2'
                            defaultMessage='Toggle sidebar'
                        />
                    </span>
                    <MenuIcon className='icon icon__menu icon--sidebarHeaderTextColor'/>
                    <NotifyCounts/>
                </button>
            );
        }

        return lhsButton;
    }

    createRhsButton = (currentId) => {
        let rhsButton;
        if (currentId != null) {
            rhsButton = (
                <button
                    key='navbar-toggle-menu'
                    type='button'
                    className='navbar-toggle navbar-right__icon menu-toggle pull-right'
                    data-toggle='collapse'
                    data-target='#sidebar-nav'
                    onClick={this.toggleRightSidebar}
                >
                    <MenuIcon/>
                </button>
            );
        }

        return rhsButton;
    }

    showChannelInviteModalButton = () => {
        if (this.refs.channelInviteModalButton) {
            this.refs.channelInviteModalButton.show();
        }
    }

    render() {
        const {channel, currentUser} = this.props;

        const collapseButtons = this.createCollapseButtons(currentUser.id);

        return (
            <div>
                <nav
                    className='navbar navbar-default navbar-fixed-top'
                    role='navigation'
                >
                    <div className='container-fluid theme'>
                        <div className='navbar-header'>
                            {collapseButtons}
                            <ShowSearchButton/>
                            <NavbarInfoButton
                                ref='headerOverlay'
                                channel={channel}
                                showEditChannelHeaderModal={this.showEditChannelHeaderModal}
                                isReadOnly={this.props.isReadOnly}
                            />
                            {searchButton}
                            <MobileChannelHeaderPlug
                                channel={channel}
                                isDropdown={false}
                            />
                            <MobileChannelHeaderDropdown/>
                        </div>
                    </div>
                </nav>
            </div>
        );
    }
}
