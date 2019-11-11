// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

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

type Props = {
    id?: string;
    postId?: string;
    text: React.ReactNode;
    subMenu?: Props[];
    icon?: React.ReactNode;
    action?: (id?: string) => {};
    filter?: (id?: string) => {};
    xOffset?: number;
    ariaLabel?: string;
    root?: boolean;
    show?: boolean;
}

type State = {
    show: boolean;
}

export default class SubMenuItem extends React.PureComponent<Props, State> {
    private node: React.RefObject<any>;

    public static defaultProps = {
        show: true,
    };

    public constructor(props: Props) {
        super(props);
        this.node = React.createRef();

        this.state = {
            show: false,
        };
    }

    private show = () => {
        this.setState({show: true});
    }

    private hide = () => {
        this.setState({show: false});
    }

    private onClick = (event: React.MouseEvent<HTMLElement>) => {
        const {id, postId, subMenu, action, root} = this.props;
        const isMobile = Utils.isMobile();
        const pathPair = Object.entries(event.nativeEvent).find(([key, value]) => key === 'path');
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
        } else if (path && // the first 2 elements in path match original event id
            path.slice(0, 2).find((e) => e.id === id) &&
            action) {
            action(postId);
        } else if (!path && !event.nativeEvent.composedPath && action) { //for tests only that don't contain `path` or `composedPath`
            action(postId);
        } else if (!path && (event.nativeEvent.composedPath() as HTMLElement[]).slice(0, 2).find((e) => e.id === id) && action) {
            action(postId);
        }
    }

    public render() {
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
            visibility: (this.state.show && hasSubmenu && !isMobile ? 'visible' : 'hidden') as 'visible' | 'hidden',
            right: (parseInt(String(xOffset), 10) - offset) + 'px',
        };

        let subMenuContent: React.ReactNode = '';

        if (!isMobile) {
            subMenuContent = (
                <ul
                    className={'a11y__popup Menu dropdown-menu SubMenu'}
                    style={subMenuStyle}
                >
                    {hasSubmenu ? subMenu!.map((s) => {
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
