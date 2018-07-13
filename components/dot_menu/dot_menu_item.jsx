// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

export default class DotMenuItem extends React.PureComponent {
    static propTypes = {
        handleMenuItemActivated: PropTypes.func.isRequired,
        menuItemText: PropTypes.element,
    };

    render() {
        return (
            <li
                role='presentation'
            >
                <button
                    className='style--none'
                    role='menuitem'
                    onClick={this.props.handleMenuItemActivated}
                >
                    {this.props.menuItemText}
                </button>
            </li>
        );
    }
}
