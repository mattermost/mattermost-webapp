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
        mobile: PropTypes.bool,
        id: PropTypes.string,
        ariaLabel: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);
        this.node = React.createRef();
    }

    // Used from DotMenu component to know in which direction show the menu
    rect() {
        if (this.node && this.node.current) {
            return this.node.current.getBoundingClientRect();
        }
        return null;
    }

    render() {
        const {children, openUp, openLeft, mobile, id, ariaLabel} = this.props;
        const styles = {};
        if (openLeft && (!isMobile() || mobile === false)) {
            styles.left = 'inherit';
            styles.right = 0;
        }
        if (openUp && (!isMobile() || mobile === false)) {
            styles.bottom = '100%';
            styles.top = 'auto';
        }

        return (
            <ul
                id={id}
                ref={this.node}
                className='Menu dropdown-menu'
                style={styles}
                role='menu'
                aria-label={ariaLabel}
            >
                {children}
            </ul>
        );
    }
}
