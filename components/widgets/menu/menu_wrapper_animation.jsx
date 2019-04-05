// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {tween, styler} from 'popmotion';
import {CSSTransition} from 'react-transition-group';

const ANIMATION_DURATION = 80;

export default class MenuWrapperAnimation extends React.PureComponent {
    static propTypes = {
        children: PropTypes.node,
        show: PropTypes.bool.isRequired,
    };

    onEntering = (node) => {
        const nodeStyler = styler(node);
        tween({from: {opacity: 0}, to: {opacity: 1}, duration: ANIMATION_DURATION}).start(nodeStyler.set);
    }

    onExiting = (node) => {
        const nodeStyler = styler(node);
        tween({from: {opacity: 1}, to: {opacity: 0}, duration: ANIMATION_DURATION}).start(nodeStyler.set);
    }

    render() {
        return (
            <CSSTransition
                in={this.props.show}
                classNames='MenuWrapperAnimation'
                enter={true}
                exit={true}
                mountOnEnter={true}
                unmountOnExit={true}
                onEntering={this.onEntering}
                onExiting={this.onExiting}
                timeout={{
                    enter: ANIMATION_DURATION,
                    exit: ANIMATION_DURATION,
                }}
            >
                {this.props.children}
            </CSSTransition>
        );
    }
}

