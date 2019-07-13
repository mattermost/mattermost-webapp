// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import FocusTrap from 'focus-trap-react';

import {isMobile} from 'utils/utils';

export default class Menu extends React.PureComponent {
    static propTypes = {
        children: PropTypes.node,
        openLeft: PropTypes.bool,
        openUp: PropTypes.bool,
        id: PropTypes.string,
        ariaLabel: PropTypes.string.isRequired,
        customStyles: PropTypes.object,
    };

    constructor(props) {
        super(props);
        this.node = React.createRef();

        this.state = {
            activeTrap: false,
        };

        this.mountTrap = this.mountTrap.bind(this);
        this.unmountTrap = this.unmountTrap.bind(this);
    }

    mountTrap() {
        this.setState({activeTrap: true});
    }

    unmountTrap() {
        this.setState({activeTrap: false});
    }

    componentDidMount() {
        setTimeout(() => {
            this.mountTrap();
        }, 0);
    }

    // Used from DotMenu component to know in which direction show the menu
    rect() {
        if (this.node && this.node.current) {
            return this.node.current.getBoundingClientRect();
        }
        return null;
    }

    render() {
        const {children, openUp, openLeft, id, ariaLabel, customStyles} = this.props;
        let styles = {};
        if (customStyles) {
            styles = customStyles;
        } else {
            if (openLeft && !isMobile()) {
                styles.left = 'inherit';
                styles.right = 0;
            }
            if (openUp && !isMobile()) {
                styles.bottom = '100%';
                styles.top = 'auto';
            }
        }

        return (
            <FocusTrap active={this.state.activeTrap}>
                <ul
                    id={id}
                    className='a11y__popup Menu dropdown-menu'
                    style={styles}
                    role='menu'
                    aria-label={ariaLabel}
                >
                    {this.focusText}
                    <div ref={this.node}>
                        {children}
                    </div>
                </ul>
            </FocusTrap>
        );
    }
}
