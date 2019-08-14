// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import Constants from 'utils/constants.jsx';

import MenuWrapperAnimation from './menu_wrapper_animation.jsx';

export default class MenuWrapper extends React.PureComponent {
    static propTypes = {
        children: PropTypes.node,
        className: PropTypes.string,
        onToggle: PropTypes.func,
        animationComponent: PropTypes.any.isRequired,
    };

    static defaultProps = {
        className: '',
        animationComponent: MenuWrapperAnimation,
    };

    constructor(props) {
        if (!Array.isArray(props.children) || props.children.length !== 2) {
            throw new Error('MenuWrapper needs exactly 2 children');
        }
        super(props);
        this.state = {
            open: false,
        };
        this.node = React.createRef();
    }

    componentDidMount() {
        document.addEventListener('click', this.closeOnBlur, true);
        document.addEventListener('keyup', this.keyboardClose, true);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.closeOnBlur, true);
        document.removeEventListener('keyup', this.keyboardClose, true);
    }

    keyboardClose = (e) => {
        if (e.key === Constants.KeyCodes.ESCAPE[0]) {
            this.close();
        }

        if (e.key === Constants.KeyCodes.TAB[0]) {
            this.closeOnBlur(e);
        }
    }

    closeOnBlur = (e) => {
        if (this.node.current && this.node.current.contains(e.target)) {
            return;
        }

        this.close();
    }

    close = () => {
        if (this.state.open) {
            this.setState({open: false});
            if (this.props.onToggle) {
                this.props.onToggle(false);
            }
        }
    }

    toggle = () => {
        const newState = !this.state.open;
        this.setState({open: newState});
        if (this.props.onToggle) {
            this.props.onToggle(newState);
        }
    }

    render() {
        const {children} = this.props;

        const Animation = this.props.animationComponent;

        return (
            <div
                className={'MenuWrapper ' + this.props.className}
                onClick={this.toggle}
                ref={this.node}
            >
                {children[0]}
                <Animation show={this.state.open}>
                    {children[1]}
                </Animation>
            </div>
        );
    }
}
