// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import HeaderIconWrapper from 'components/channel_header/components/header_icon_wrapper';

export default class ChannelHeaderPlug extends React.PureComponent {
    static propTypes = {

        /*
         * Components or actions for to add as channel header buttons
         */
        components: PropTypes.array.isRequired,

        channel: PropTypes.object.isRequired,
        channelMember: PropTypes.object.isRequired,

        /*
         * Logged in user's theme
         */
        theme: PropTypes.object.isRequired,
    }

    createButton(plug) {
        if (plug.component) {
            const PluginComponent = plug.buttonComponent;
            return (
                <PluginComponent
                    channel={this.props.channel}
                    channelMember={this.props.channelMember}
                    theme={this.props.theme}
                />
            );
        }

        return (
            <HeaderIconWrapper
                iconComponent={plug.icon}
                onClick={plug.action}
                buttonId={plug.id}
            />
        );
    }

    createDropdown(plugs) {
        const items = [];

        plugs.forEach((plug) => {
            if (plug.dropdown_component) {
                const PluginComponent = plug.dropdownComponent;
                items.push(
                    <PluginComponent
                        channel={this.props.channel}
                        channelMember={this.props.channelMember}
                        theme={this.props.theme}
                    />
                );
                return;
            }

            items.push(
                <li role='presentation'>
                    <a
                        role='menuitem'
                        href='#'
                        onClick={plug.action}
                    >
                        <span className='pull-left'>{plug.icon}</span>
                        {plug.dropdownText}
                    </a>
                </li>
            );
        });

        return (
            <div className='flex-child'>
                <div className='dropdown'>
                    <button
                        id='pluginChannelHeaderButtonDropdown'
                        className='dropdown-toggle channel-header__icon icon--hidden style--none'
                        type='button'
                        data-toggle='dropdown'
                        aria-expanded='true'
                    >
                        <span className='fa fa-ellipsis-h icon__ellipsis'/>
                    </button>
                    <ul
                        className='dropdown-menu channel-header_plugin-dropdown'
                        role='menu'
                    >
                        {items}
                    </ul>
                </div>
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
