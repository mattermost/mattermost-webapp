// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

export default class MobileChannelHeaderPlug extends React.PureComponent {
    static propTypes = {

        /*
         * Components or actions to add as channel header buttons
         */
        components: PropTypes.array,

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

    createButton = (plug) => {
        return (
            <li
                key={'mobileChannelHeaderItem' + plug.id}
                role='presentation'
                className='MenuItem'
            >
                <a
                    role='menuitem'
                    href='#'
                    onClick={() => this.fireAction(plug)}
                >
                    {plug.dropdownText}
                </a>
            </li>
        );
    }

    createList(plugs) {
        return plugs.map(this.createButton);
    }

    fireAction(plug) {
        return plug.action(this.props.channel, this.props.channelMember);
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
