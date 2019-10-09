// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import * as Utils from 'utils/utils.jsx';
import {showMobileSubMenuModal} from 'actions/global_actions';

import './menu_item.scss';

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
export default class SubMenuItem extends React.PureComponent {
    static propTypes= {
        id: PropTypes.string,
        postId: PropTypes.string,
        text: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
        subMenu: PropTypes.arrayOf(PropTypes.object),
        icon: PropTypes.node,
        action: PropTypes.func,
        filter: PropTypes.func,
        xOffset: PropTypes.number,
        ariaLabel: PropTypes.string,
        root: PropTypes.bool,
    };
    static defaultProps = {
        show: true,
    };

    constructor(props) {
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

    onClick = (event) => {
        const {id, postId, subMenu, action, root} = this.props;
        const isMobile = Utils.isMobile();
        if (isMobile) {
            if (subMenu && subMenu.length) { // if contains a submenu, call openModal with it
                if (!root) { //required to close only the original menu
                    event.stopPropagation();
                }
                showMobileSubMenuModal(subMenu);
            } else if (action) { // leaf node in the tree handles action only
                action(postId);
            }
        } else if (event.nativeEvent.path && // the first 2 elements in path match original event id
            event.nativeEvent.path.slice(0, 2).find((e) => e.id === id) &&
            action) {
            action(postId);
        } else if (!event.nativeEvent.path && !event.nativeEvent.composedPath && action) { //for tests only that don't contain `path` or `composedPath`
            action(postId);
        } else if (!event.nativeEvent.path && event.nativeEvent.composedPath().slice(0, 2).find((e) => e.id === id) && action) {
            action(postId);
        }
    }

    render() {
        const {id, postId, text, subMenu, root, icon, filter, xOffset, ariaLabel} = this.props;
        const isMobile = Utils.isMobile();

        if (filter && !filter(id)) {
            return ('');
        }

        let textProp = text;
        if (icon) {
            textProp = (
                <React.Fragment>
                    <span className='icon'>{icon}</span>
                    {text}
                </React.Fragment>
            );
        }

        const hasSubmenu = subMenu && subMenu.length;
        const parentWidth = this.node && this.node.current ? this.node.current.getBoundingClientRect().width : 0;
        const childOffset = (React.isValidElement(text)) ? 20 : 0;
        const offset = (root ? 2 : childOffset);
        const subMenuStyle = {
            visibility: this.state.show && hasSubmenu && !isMobile ? 'visible' : 'hidden',
            right: (parseInt(xOffset, 10) - offset) + 'px',
        };

        let subMenuContent = '';

        if (!isMobile) {
            subMenuContent = (
                <ul
                    className={'a11y__popup Menu dropdown-menu SubMenu'}
                    style={subMenuStyle}
                >
                    {hasSubmenu ? subMenu.map((s) => {
                        return (
                            <SubMenuItem
                                key={s.id}
                                id={s.id}
                                postId={postId}
                                text={s.text}
                                subMenu={s.subMenu}
                                action={s.action}
                                filter={s.filter}
                                xOffset={parentWidth}
                                ariaLabel={ariaLabel}
                                root={false}
                            />
                        );
                    }) : ''}
                </ul>
            );
        }

        return (
            <li
                className={'SubMenuItem MenuItem'}
                role='menuitem'
                id={id + '_menuitem'}
                ref={this.node}
            >
                <div
                    id={id}
                    aria-label={ariaLabel}
                    onMouseEnter={this.show}
                    onMouseLeave={this.hide}
                    onClick={this.onClick}
                >
                    <span
                        id={'channelHeaderDropdownIconLeft_' + id}
                        className={'fa fa-angle-left SubMenu__icon-left' + (hasSubmenu && !isMobile ? '' : '-empty' + (isMobile ? ' mobile' : ''))}
                        aria-label={Utils.localizeMessage('post_info.submenu.icon', 'submenu icon').toLowerCase()}
                    />
                    {textProp}
                    <span
                        id={'channelHeaderDropdownIconRight_' + id}
                        className={'fa fa-angle-right SubMenu__icon-right' + (hasSubmenu && isMobile ? '' : '-empty')}
                        aria-label={Utils.localizeMessage('post_info.submenu.icon', 'submenu icon').toLowerCase()}
                    />
                    {subMenuContent}
                </div>
            </li>
        );
    }
}
