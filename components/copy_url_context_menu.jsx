// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {ContextMenu, ContextMenuTrigger, MenuItem} from 'react-contextmenu';
import {FormattedMessage} from 'react-intl';

import * as Utils from '../utils/utils';

export default class CopyUrlContextMenu extends React.Component {
    static propTypes = {

        /**
         * The child component that will be right-clicked on to show the context menu
         */
        children: PropTypes.element,

        /**
         * The link to copy to the user's clipboard when the 'Copy' option is selected from the context menu
         */
        link: PropTypes.string.isRequired,

        /**
         * A unique id differentiating this instance of context menu from others on the page. Will be set to a random value if not provided.
         */
        menuId: PropTypes.string.isRequired,
    };

    render() {
        const contextMenu = (
            <ContextMenu id={'copy-url-context-menu' + this.props.menuId}>
                <MenuItem
                    data={{link: this.props.link}}
                    onClick={Utils.copyToClipboard}
                >
                    <FormattedMessage
                        id='copy_url_context_menu.getChannelLink'
                        defaultMessage='Copy Link'
                    />
                </MenuItem>
            </ContextMenu>
        );

        const contextMenuTrigger = (
            <ContextMenuTrigger id={'copy-url-context-menu' + this.props.menuId}>
                {this.props.children}
            </ContextMenuTrigger>
        );

        return (
            <span>
                {contextMenu}
                {contextMenuTrigger}
            </span>
        );
    }
}
