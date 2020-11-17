// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {ContextMenu, ContextMenuTrigger, MenuItem} from 'react-contextmenu';
import {FormattedMessage} from 'react-intl';

export default class CopyUrlContextMenu extends React.PureComponent {
    static propTypes = {

        // The child component that will be right-clicked on to show the context menu
        children: PropTypes.element,

        // The link to copy to the user's clipboard when the 'Copy' option is selected from the context menu
        link: PropTypes.string.isRequired,

        // A unique id differentiating this instance of context menu from others on the page.
        menuId: PropTypes.string.isRequired,

        siteURL: PropTypes.string.isRequired,

        actions: PropTypes.shape({
            copyToClipboard: PropTypes.func.isRequired,
        }),
    };

    copy = () => {
        let link = this.props.link;

        // Transform relative links to absolute ones for copy and paste.
        if (link.indexOf('http://') === -1 && link.indexOf('https://') === -1) {
            link = this.props.siteURL + link;
        }

        this.props.actions.copyToClipboard(link);
    }

    render() {
        const contextMenu = (
            <ContextMenu id={'copy-url-context-menu' + this.props.menuId}>
                <MenuItem
                    onClick={this.copy}
                >
                    <FormattedMessage
                        id='copy_url_context_menu.getChannelLink'
                        defaultMessage='Copy Link'
                    />
                </MenuItem>
            </ContextMenu>
        );

        const contextMenuTrigger = (
            <ContextMenuTrigger
                id={'copy-url-context-menu' + this.props.menuId}
                holdToDisplay={-1}
            >
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
