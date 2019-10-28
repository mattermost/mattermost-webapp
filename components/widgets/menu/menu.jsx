// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {isMobile} from 'utils/utils';

import SubMenuItem from './menu_items/submenu_item.jsx';

import MenuGroup from './menu_group';
import MenuItemAction from './menu_items/menu_item_action';
import MenuItemExternalLink from './menu_items/menu_item_external_link';
import MenuItemLink from './menu_items/menu_item_link';
import MenuItemToggleModalRedux from './menu_items/menu_item_toggle_modal_redux';

import './menu.scss';

export default class Menu extends React.PureComponent {
    static Group = MenuGroup
    static ItemAction = MenuItemAction
    static ItemExternalLink = MenuItemExternalLink
    static ItemLink = MenuItemLink
    static ItemToggleModalRedux = MenuItemToggleModalRedux
    static ItemSubMenu = SubMenuItem

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
        this.observer = new MutationObserver(this.hideUnneededDividers);
    }

    hideUnneededDividers = () => {
        if (this.node.current === null) {
            return;
        }

        this.observer.disconnect();
        const children = Object.values(this.node.current.children).slice(0, this.node.current.children.length);

        // Hiding dividers at beginning and duplicated ones
        let prevWasDivider = false;
        let isAtBeginning = true;
        for (const child of children) {
            if (child.classList.contains('menu-divider') || child.classList.contains('mobile-menu-divider')) {
                child.style.display = 'block';
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
        this.observer.observe(this.node.current, {attributes: true, childList: true, subtree: true});
    }

    componentDidMount() {
        this.hideUnneededDividers();
    }

    componentDidUpdate() {
        this.hideUnneededDividers();
    }

    componentWillUnmount() {
        this.observer.disconnect();
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
            <div
                aria-label={ariaLabel}
                className='a11y__popup Menu'
                id={id}
                role='menu'
            >
                <ul
                    ref={this.node}
                    style={styles}
                    className='Menu__content dropdown-menu'
                >
                    {children}
                </ul>
            </div>
        );
    }
}
