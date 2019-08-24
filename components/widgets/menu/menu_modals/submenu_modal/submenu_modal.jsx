// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';

import MenuWrapper from '../../menu_wrapper';
import Menu from '../../menu';

export default class SubMenuModal extends React.PureComponent {
    static propTypes = {
        elements: PropTypes.array,
        action: PropTypes.func,
        onHide: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {
            show: true,
        };
    }

    onHide = () => {
        this.setState({show: false});
    }

    render() {
        return (
            <Modal
                dialogClassName='a11y__modal mobile-sub-menu'
                show={this.state.show}
                onHide={this.onHide}
                onExited={this.props.onHide}
                enforceFocus={false}
                id='submenuModal'
                role='dialog'
                aria-labelledby='submenuModalLabel'
            >
                <Modal.Body
                    onClick={this.onHide}
                >
                    <MenuWrapper>
                        <Menu
                            openLeft={true}
                            ariaLabel={'Mobile Submenu'}
                        >
                            {this.props.elements.map((element) => {
                                return (
                                    <Menu.ItemSubMenu
                                        key={element.id}
                                        id={element.id}
                                        text={element.text}
                                        subMenu={element.subMenu}
                                        action={this.props.action}
                                        xOffset={0}
                                        root={false}
                                    />
                                );
                            })}
                        </Menu>
                        <div/>
                    </MenuWrapper>
                </Modal.Body>
            </Modal>
        );
    }
}
