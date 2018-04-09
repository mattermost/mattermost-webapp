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
        onScroll: PropTypes.func,

        id: PropTypes.string,
    };

    componentDidMount() {
        this.refs.container.addEventListener('wheel', this.handleMouseWheel);
        window.addEventListener('keypress', this.handleKeyPress);
    }

    componentWillUnmount() {
        this.refs.container.removeEventListener('wheel', this.handleMouseWheel);
        window.removeEventListener('keypress', this.handleKeyPress);
    }

    // TODO: Handle Keyboard events like UP/DOWN, PAGE UP/PAGE DOWN.

    handleMouseWheel = (event) => {
        if (event.deltaY !== 0) {
            this.refs.container.scrollBy(0, -event.deltaY*5);
            event.preventDefault();
        }
    }

    handleKeyPress = (event) => {
        // Be more restrictive handling events (for example, ctrl/alt/meta
        // keys, or target element, to avoid interference with shortcuts or the
        // post input textarea
        if (event.key === "PageUp") {
            event.preventDefault();
            this.refs.container.scrollBy(0, 150);
        } else if (event.key === "PageDown") {
            event.preventDefault();
            this.refs.container.scrollBy(0, -150);
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            this.refs.container.scrollBy(0, 15);
        } else if (event.key === "ArrowDown") {
            event.preventDefault();
            this.refs.container.scrollBy(0, -15);
        }
    }

    render() {
        return (
            <div
                onScroll={this.props.onScroll}
                ref="container"
                style={{
                    transform: "rotate(180deg) scaleX(-1)",
                    overflowY: "scroll",
                }}
                id={this.props.id}
            >
                <div style={{transform: "rotate(180deg) scaleX(-1)"}}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}
