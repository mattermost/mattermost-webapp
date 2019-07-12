// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

export default class EmojiPickerCategory extends React.Component {
    static propTypes = {
        category: PropTypes.string.isRequired,
        icon: PropTypes.node.isRequired,
        onCategoryClick: PropTypes.func.isRequired,
        selected: PropTypes.bool.isRequired,
        enable: PropTypes.bool.isRequired,
    }

    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }
    shouldComponentUpdate(nextProps) {
        return nextProps.selected !== this.props.selected ||
            nextProps.enable !== this.props.enable;
    }

    handleClick(e) {
        e.preventDefault();
        this.props.onCategoryClick(this.props.category);
    }

    render() {
        let className = 'emoji-picker__category';
        if (this.props.selected) {
            className += ' emoji-picker__category--selected';
        }

        if (!this.props.enable) {
            className += ' disable';
        }

        return (
            <a
                className={className}
                href='#'
                onClick={this.handleClick}
                aria-label={this.props.category}
            >
                {this.props.icon}
            </a>
        );
    }
}
