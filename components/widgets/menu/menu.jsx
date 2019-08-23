// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {isMobile} from 'utils/utils';

import MenuGroup from './menu_group';
import MenuItemAction from './menu_items/menu_item_action';
import MenuItemBlockableLink from './menu_items/menu_item_blockable_link';
import MenuItemExternalLink from './menu_items/menu_item_external_link';
import MenuItemLink from './menu_items/menu_item_link';
import MenuItemToggleModalRedux from './menu_items/menu_item_toggle_modal_redux';

export default class Menu extends React.PureComponent {
    static Group = MenuGroup
    static ItemAction = MenuItemAction
    static ItemBlockableLink = MenuItemBlockableLink
    static ItemExternalLink = MenuItemExternalLink
    static ItemLink = MenuItemLink
    static ItemToggleModalRedux = MenuItemToggleModalRedux

    static propTypes = {
        children: PropTypes.node,
        openLeft: PropTypes.bool,
        openUp: PropTypes.bool,
        id: PropTypes.string,
        ariaLabel: PropTypes.string.isRequired,
        customStyles: PropTypes.object,
    };

    constructor(props) {
        super(props);
        this.node = React.createRef();
    }

    hideUnneededDividers = () => {
        if (this.node.current === null) {
            return;
        }

        const children = Object.values(this.node.current.children).slice(0, this.node.current.children.length);

        // Hiding dividers at beginning and duplicated ones
        let prevWasDivider = false;
        let isAtBeginning = true;
        for (const child of children) {
            if (child.classList.contains('menu-divider') || child.classList.contains('mobile-menu-divider')) {
                if (isAtBeginning || prevWasDivider) {
                    child.style.display = 'none';
                }
                prevWasDivider = true;
            } else {
                isAtBeginning = false;
                prevWasDivider = false;
            }
        }

        // Hiding trailing dividers
        for (const child of children.reverse()) {
            if (child.classList.contains('menu-divider') || child.classList.contains('mobile-menu-divider')) {
                child.style.display = 'none';
            } else {
                break;
            }
        }
    }

    componentDidMount() {
        this.hideUnneededDividers();
    }

    componentDidUpdate() {
        this.hideUnneededDividers();
    }

    // Used from DotMenu component to know in which direction show the menu
    rect() {
        if (this.node && this.node.current) {
            return this.node.current.getBoundingClientRect();
        }
        return null;
    }

    render() {
        const {children, openUp, openLeft, id, ariaLabel, customStyles} = this.props;
        let styles = {};
        if (customStyles) {
            styles = customStyles;
        } else {
            if (openLeft && !isMobile()) {
                styles.left = 'inherit';
                styles.right = 0;
            }
            if (openUp && !isMobile()) {
                styles.bottom = '100%';
                styles.top = 'auto';
            }
        }

        return (
            <ul
                id={id}
                className='a11y__popup Menu dropdown-menu'
                ref={this.node}
                style={styles}
                role='menu'
                aria-label={ariaLabel}
            >
                {children}
            </ul>
        );
    }
}
