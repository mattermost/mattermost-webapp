// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {CSSTransition} from 'react-transition-group';

import CloseIcon from 'components/widgets/icons/close_icon';

import './full_screen_modal.scss';

// This must be on sync with the animation time in ./full_screen_modal.scss
const ANIMATION_DURATION = 100;

export default class FullScreenModal extends React.Component {
    static propTypes = {
        show: PropTypes.bool.isRequired,
        children: PropTypes.node.isRequired,
        onClose: PropTypes.func.isRequired,
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeypress);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeypress);
    }

    handleKeypress = (e) => {
        if (e.key === 'Escape' && this.props.show) {
            this.close();
        }
    }

    close = () => {
        this.props.onClose();
    }

    render() {
        return (
            <CSSTransition
                in={this.props.show}
                classNames='FullScreenModal'
                mountOnEnter={true}
                unmountOnExit={true}
                timeout={ANIMATION_DURATION}
                appear={true}
            >
                <div className='FullScreenModal'>
                    <CloseIcon
                        className='close-x'
                        onClick={this.close}
                    />
                    {this.props.children}
                </div>
            </CSSTransition>
        );
    }
}
