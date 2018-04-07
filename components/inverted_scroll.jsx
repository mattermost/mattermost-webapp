// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';

export default class InvertedScroll extends React.Component {
    static propTypes = {
        /**
         * Content protected by the permissions gate
         */
        children: PropTypes.node.isRequired,
    };

    componentDidMount() {
        this.refs.container.addEventListener('wheel', this.handleMouseWheel);
    }

    componentWillUnmount() {
        this.refs.container.removeEventListener('wheel', this.handleMouseWheel);
    }

    // TODO: Handle Keyboard events like UP/DOWN, PAGE UP/PAGE DOWN.

    handleMouseWheel = (event) => {
        if (event.deltaY !== 0) {
            this.refs.container.scrollBy(0, -event.deltaY*5);
            event.preventDefault();
        }
    }

    render() {
        return (
            <div ref="container" style={{
                transform: "rotate(180deg) scaleX(-1)",
                overflowY: "scroll",
            }}>
                <div style={{transform: "rotate(180deg) scaleX(-1)"}}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}
