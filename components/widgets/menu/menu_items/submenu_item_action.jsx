// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import * as Utils from 'utils/utils.jsx';
import {ModalIdentifiers} from 'utils/constants';
import SubMenuModal from '../../../submenu_modal/submenu_modal.jsx';

export default class SubMenuItemAction extends React.PureComponent {
    static propTypes= {
        id: PropTypes.string,
        text: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
        subMenu: PropTypes.arrayOf(PropTypes.object),
        icon: PropTypes.node,
        action: PropTypes.func.isRequired,
        openModal: PropTypes.func,
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

    handleShowMobileSubMenuItem = (elements, action) => {
        const openModal = this.props.openModal;
        const submenuModalData = {
            ModalId: ModalIdentifiers.PLUGIN_MOBILE_SUBMENU,
            dialogType: SubMenuModal,
            dialogProps: {
                elements,
                action,
                openModal,
            },
        };

        this.props.openModal(submenuModalData);
    }

    render() {
        const {id, text, subMenu, icon, action, xOffset, ariaLabel, root} = this.props;
        const isMobile = Utils.isMobile();

        let textProp = text;
        if (icon) {
            textProp = (
                <React.Fragment>
                    <span className='icon'>{icon}</span>
                    {text}
                </React.Fragment>
            );
        }

        const parentWidth = this.node && this.node.current ? this.node.current.getBoundingClientRect().width - 19 : 0;

        const subMenuStyle = {
            visibility: this.state.show && subMenu && subMenu.length && !isMobile ? 'visible' : 'hidden',
            right: (parseInt(xOffset, 10) - 1) + 'px',
        };

        return (
            <li
                className='MenuItem'
                role='menuitem'
                id={id + '_menuitem'}
                ref={this.node}
            >
                <div
                    id={id}
                    aria-label={ariaLabel}
                    onMouseEnter={this.show}
                    onMouseLeave={this.hide}
                    onClick={(event) => {
                        if (isMobile) {
                            if (subMenu && subMenu.length) {
                                if (!root) {
                                    event.stopPropagation();
                                }
                                this.handleShowMobileSubMenuItem(subMenu, action);
                            } else {
                                action(id);
                            }
                        } else if (event.nativeEvent.path &&
                                    event.nativeEvent.path.slice(0, 2).find((e) => e.id === id)) {
                            action(id);
                        } else if (!event.nativeEvent.path) {
                            action(id);
                        }
                    }}
                >
                    <span
                        id={'channelHeaderDropdownIcon_' + id}
                        className={'fa fa-angle-left SubMenu__icon' + (subMenu && subMenu.length ? '' : '-empty')}
                        aria-label='submenu icon'
                    />
                    {textProp}
                    <ul
                        className={'a11y__popup Menu dropdown-menu SubMenu'}
                        style={subMenuStyle}
                    >
                        {isMobile || !subMenu ? '' : subMenu.map((s) => {
                            return (
                                <SubMenuItemAction
                                    key={s.id}
                                    id={s.id}
                                    text={s.text}
                                    subMenu={s.subMenu}
                                    action={action}
                                    xOffset={parentWidth}
                                    aria-label={ariaLabel}
                                    isMobile={isMobile}
                                    root={false}
                                />
                            );
                        })}
                    </ul>
                </div>
            </li>
        );
    }
}
