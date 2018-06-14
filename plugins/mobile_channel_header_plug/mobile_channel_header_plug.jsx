// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

export default class MobileChannelHeaderPlug extends React.PureComponent {
    static propTypes = {

        /*
         * Components or actions for to add as channel header buttons
         */
        components: PropTypes.array.isRequired,

        /*
         * Set to true if the plug is in the dropdown
         */
        isDropdown: PropTypes.bool.isRequired,

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
            <div
                className='navbar-toggle navbar-right__icon pull-right'
                onClick={plug.action}
            >
                <span className='icon navbar-plugin-button'>
                    {plug.icon}
                </span>
            </div>
        );
    }

    createList(plugs) {
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
                <li
                    key={'mobileChannelHeaderItem' + plug.id}
                    role='presentation'
                >
                    <a
                        role='menuitem'
                        href='#'
                        onClick={plug.action}
                    >
                        {plug.dropdownText}
                    </a>
                </li>
            );
        });

        return items;
    }

    render() {
        const components = this.props.components || [];

        if (components.length === 0) {
            return null;
        } else if (components.length === 1) {
            return this.createButton(components[0]);
        }

        if (!this.props.isDropdown) {
            return null;
        }

        return this.createList(components);
    }
}
