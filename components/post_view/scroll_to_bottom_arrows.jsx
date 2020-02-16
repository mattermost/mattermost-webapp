// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';

import ScrollToBottomIcon from 'components/widgets/icons/scroll_to_bottom_icon';

export default class ScrollToBottomArrows extends React.PureComponent {
    static propTypes = {
        isScrolling: PropTypes.bool.isRequired,
        atBottom: PropTypes.bool,
        onClick: PropTypes.func.isRequired,
    };

    render() {
        // only show on mobile
        if ($(window).width() > 768) {
            return null;
        }

        let className = 'post-list__arrows';
        if (this.props.isScrolling && this.props.atBottom === false) {
            className += ' scrolling';
        }

        return (
            <div
                className={className}
                onClick={this.props.onClick}
            >
                <ScrollToBottomIcon/>
            </div>
        );
    }
}
