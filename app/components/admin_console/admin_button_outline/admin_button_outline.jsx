// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import './admin_button_outline.scss';

export default class AdminButtonOutline extends React.PureComponent {
    static propTypes = {
        onClick: PropTypes.func.isRequired,
        children: PropTypes.string.isRequired,
        disabled: PropTypes.bool,
    }
    render() {
        return (
            <button
                type='button'
                onClick={this.props.onClick}
                className={'AdminButtonOutline btn btn-primary'}
                disabled={this.props.disabled}
            >
                {this.props.children}
            </button>
        );
    }
}
