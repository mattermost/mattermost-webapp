// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

import {isMobile} from 'utils/utils';

export default class Menu extends React.PureComponent {
    static propTypes = {
        children: PropTypes.node,
        openLeft: PropTypes.bool,
        openUp: PropTypes.bool,
    };

    constructor(props) {
        super(props);
        this.node = React.createRef();
    }

    rect() {
        if (this.node && this.node.current) {
            return this.node.current.getBoundingClientRect();
        }
        return null;
    }

    render() {
        const {children, openUp, openLeft} = this.props;
        const styles = {};
        if (openLeft && !isMobile()) {
            styles.left = 'inherit';
            styles.right = 0;
        }
        if (openUp && !isMobile()) {
            styles.bottom = '100%';
            styles.top = 'auto';
        }

        return (
            <ul
                ref={this.node}
                className='Menu dropdown-menu'
                style={styles}
                role='menu'
                aria-labelledby='channel_header_dropdown'
            >
                {children}
            </ul>
        );
    }
}
