// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {CSSProperties} from 'react';
import classNames from 'classnames';

import * as Utils from 'utils/utils.jsx';
import {showMobileSubMenuModal} from 'actions/global_actions';

import './menu_item.scss';
import Constants from 'utils/constants';

// Requires an object conforming to a submenu structure passed to registerPostDropdownSubMenuAction
// of the form:
// {
//     "id": "A",
//     "parentMenuId": null,
//     "text": "A text",
//     "subMenu": [
//         {
//             "id": "B",
//             "parentMenuId": "A",
//             "text": "B text"
//             "subMenu": [],
//             "action": () => {},
//             "filter": () => {},
//         }
//     ],
//     "action": () => {},
//     "filter": () => {},
// }
// Submenus can contain Submenus as well

export type Props = {
    id?: string;
    postId?: string;
    text: React.ReactNode;
    selectedValueText?: React.ReactNode;
    subMenu?: Props[];
    icon?: React.ReactNode;
    action?: (id?: string) => void;
    filter?: (id?: string) => boolean;
    ariaLabel?: string;
    root?: boolean;
    show?: boolean;
    direction?: 'left' | 'right';
    openUp?: boolean;
    styleSelectableItem?: boolean;
}

type State = {
    show: boolean;
}

export default class SubMenuItem extends React.PureComponent<Props, State> {
    private node: React.RefObject<HTMLLIElement>;

    public static defaultProps = {
        show: true,
        direction: 'left',
    };

    public constructor(props: Props) {
        super(props);
        this.node = React.createRef();

        this.state = {
            show: false,
        };
    }

    show = () => {
        this.setState({show: true});
    }

    hide = () => {
        this.setState({show: false});
    }

    private onClick = (event: React.SyntheticEvent<HTMLElement>) => {
        event.preventDefault();
        const {id, postId, subMenu, action, root} = this.props;
        const isMobile = Utils.isMobile();
        const pathPair = Object.entries(event.nativeEvent).find(([key]) => key === 'path');
        let path: HTMLElement[] | undefined;
        if (pathPair) {
            path = pathPair[1];
        }
        if (isMobile) {
            if (subMenu && subMenu.length) { // if contains a submenu, call openModal with it
                if (!root) { //required to close only the original menu
                    event.stopPropagation();
                }
                showMobileSubMenuModal(subMenu);
            } else if (action) { // leaf node in the tree handles action only
                action(postId);
            }
        } else if (
            path && // the first 2 elements in path match original event id
            path.slice(0, 2).find((e) => e.id === id) &&
            action
        ) {
            action(postId);
        } else if (
            !path &&
            !event.nativeEvent.composedPath &&
            action
        ) { //for tests only that don't contain `path` or `composedPath`
            action(postId);
        } else if (
            !path &&
            (event.nativeEvent.composedPath() as HTMLElement[]).slice(0, 2).find((e) => e.id === id) &&
            action
        ) {
            action(postId);
        }
    }

    handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (Utils.isKeyPressed(event, Constants.KeyCodes.ENTER)) {
            if (this.props.action) {
                this.onClick(event);
            } else {
                this.show();
            }
        }

        if (Utils.isKeyPressed(event, Constants.KeyCodes.RIGHT)) {
            if (this.props.direction === 'right') {
                this.show();
            } else {
                this.hide();
            }
        }

        if (Utils.isKeyPressed(event, Constants.KeyCodes.LEFT)) {
            if (this.props.direction === 'left') {
                this.show();
            } else {
                this.hide();
            }
        }
    }

    public render() {
        const {id, postId, text, selectedValueText, subMenu, icon, filter, ariaLabel, direction, styleSelectableItem} = this.props;
        const isMobile = Utils.isMobile();

        if (filter && !filter(id)) {
            return ('');
        }

        let textProp = text;
        if (icon) {
            textProp = (
                <React.Fragment>
                    <span className={classNames(['icon', {'sorting-menu-icon': styleSelectableItem}])}>{icon}</span>
                    {text}
                </React.Fragment>
            );
        }

        const hasSubmenu = subMenu && subMenu.length;
        const subMenuStyle: CSSProperties = {
            visibility: (this.state.show && hasSubmenu && !isMobile ? 'visible' : 'hidden') as 'visible' | 'hidden',
            top: this.node && this.node.current ? String(this.node.current.offsetTop) + 'px' : 'unset',
        };

        const menuOffset = '100%';
        if (direction === 'left') {
            subMenuStyle.right = menuOffset;
        } else {
            subMenuStyle.left = menuOffset;
        }

        let subMenuContent: React.ReactNode = '';

        if (!isMobile) {
            subMenuContent = (
                <ul
                    className={classNames(['a11y__popup Menu dropdown-menu SubMenu', {styleSelectableItem}])}
                    style={subMenuStyle}
                >
                    {hasSubmenu ? subMenu!.map((s) => {
                        const hasDivider = s.id === 'SidebarChannelMenu-moveToDivider';
                        return (
                            <div
                                className={classNames(['SubMenuItemContainer', {hasDivider}])}
                                key={s.id}
                            >
                                <SubMenuItem
                                    id={s.id}
                                    postId={postId}
                                    text={s.text}
                                    selectedValueText={s.selectedValueText}
                                    icon={s.icon}
                                    subMenu={s.subMenu}
                                    action={s.action}
                                    filter={s.filter}
                                    ariaLabel={ariaLabel}
                                    root={false}
                                    direction={s.direction}
                                />
                                {s.text === selectedValueText && <span className='sorting-menu-checkbox'>
                                    <i className='icon-check'/>
                                </span>}
                            </div>
                        );
                    }) : ''}
                </ul>
            );
        }

        return (
            <li
                className={classNames(['SubMenuItem MenuItem', {styleSelectableItem}])}
                role='menuitem'
                id={id + '_menuitem'}
                ref={this.node}
            >
                <div
                    className={classNames([{styleSelectableItemDiv: styleSelectableItem}])}
                    id={id}
                    aria-label={ariaLabel}
                    onMouseEnter={this.show}
                    onMouseLeave={this.hide}
                    onClick={this.onClick}
                    tabIndex={0}
                    onKeyDown={this.handleKeyDown}
                >
                    {id !== 'SidebarChannelMenu-moveToDivider' &&
                        <span
                            id={'channelHeaderDropdownIconLeft_' + id}
                            className={classNames([`fa fa-angle-left SubMenu__icon-left${hasSubmenu && direction === 'left' ? '' : '-empty'}`, {mobile: isMobile}])}
                            aria-label={Utils.localizeMessage('post_info.submenu.icon', 'submenu icon').toLowerCase()}
                        />}
                    {textProp}
                    {selectedValueText && <span className='selected'>{selectedValueText}</span>}
                    {id !== 'SidebarChannelMenu-moveToDivider' &&
                        <span
                            id={'channelHeaderDropdownIconRight_' + id}
                            className={classNames([`fa fa-angle-right SubMenu__icon-right${hasSubmenu && direction === 'right' ? '' : '-empty'}`, {mobile: isMobile}])}
                            aria-label={Utils.localizeMessage('post_info.submenu.icon', 'submenu icon').toLowerCase()}
                        />}
                    {subMenuContent}
                </div>
            </li>
        );
    }
}
