// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import PropTypes from 'prop-types';
import React from 'react';

export default class CustomToggle extends React.PureComponent {
    static propTypes = {
        children: PropTypes.element,
        dropdownOpen: PropTypes.bool,
        onClick: PropTypes.func,
    }

    handleClick = (e) => {
        this.props.onClick(e);
    }

    render() {
        const {children} = this.props;

        let activeClass = '';
        if (this.props.dropdownOpen) {
            activeClass = ' active';
        }

        return (
            <button
                id='pluginChannelHeaderButtonDropdown'
                className={'channel-header__icon style--none' + activeClass}
                type='button'
                onClick={this.handleClick}
            >
                {children}
            </button>
        );
    }
}
