// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import CloseIcon from 'components/svg/close_icon';

import './full_screen_modal.scss';

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
            <div className={'FullScreenModal' + (this.props.show ? ' show' : '')}>
                {this.props.show &&
                    <CloseIcon
                        className='close-x'
                        onClick={this.close}
                    />}
                {this.props.show && this.props.children}
            </div>
        );
    }
}
