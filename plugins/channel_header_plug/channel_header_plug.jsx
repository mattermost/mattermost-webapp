// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Dropdown} from 'react-bootstrap';

import HeaderIconWrapper from 'components/channel_header/components/header_icon_wrapper';
import CustomMenu from 'plugins/components/customMenu.jsx';
import CustomToggle from 'plugins/components/customToggle.jsx';

export default class ChannelHeaderPlug extends React.PureComponent {
    static propTypes = {

        /*
         * Components or actions to add as channel header buttons
         */
        components: PropTypes.array,

        channel: PropTypes.object.isRequired,
        channelMember: PropTypes.object.isRequired,

        /*
         * Logged in user's theme
         */
        theme: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {
            dropdownOpen: false,
        };
    }

    toggleDropdown = (dropdownOpen) => {
        this.setState({dropdownOpen});
    }

    onClose = () => {
        this.toggleDropdown(false);
    }

    fireActionAndClose = (action) => {
        action(this.props.channel, this.props.channelMember);
        this.onClose();
    }

    createButton = (plug) => {
        return (
            <HeaderIconWrapper
                buttonClass='channel-header__icon style--none'
                iconComponent={plug.icon}
                onClick={() => plug.action(this.props.channel, this.props.channelMember)}
                buttonId={plug.id}
                tooltipKey={'plugin'}
                tooltipText={plug.tooltipText ? plug.tooltipText : plug.dropdownText}
            />
        );
    }

    createDropdown = (plugs) => {
        const items = plugs.map((plug) => {
            return (
                <li
                    key={'channelHeaderPlug' + plug.id}
                >
                    <a
                        href='#'
                        className='overflow--ellipsis'
                        onClick={() => this.fireActionAndClose(plug.action)}
                    >
                        <span>{plug.icon}</span>
                        {plug.dropdownText}
                    </a>
                </li>
            );
        });

        return (
            <div className='flex-child'>
                <Dropdown
                    ref='dropdown'
                    id='channelHeaderPlugDropdown'
                    onToggle={this.toggleDropdown}
                    onSelect={this.onSelect}
                    open={this.state.dropdownOpen}
                >
                    <CustomToggle
                        dropdownOpen={this.state.dropdownOpen}
                        bsRole='toggle'
                    >
                        <span className='fa fa-ellipsis-h icon__ellipsis'/>
                    </CustomToggle>
                    <CustomMenu
                        bsRole='menu'
                        open={this.state.dropdownOpen}
                        onClose={this.onClose}
                    >
                        {items}
                    </CustomMenu>
                </Dropdown>
            </div>
        );
    }

    render() {
        const components = this.props.components || [];

        if (components.length === 0) {
            return null;
        } else if (components.length === 1) {
            return this.createButton(components[0]);
        }

        return this.createDropdown(components);
    }
}
