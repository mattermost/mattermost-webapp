// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {tween, styler, composite, delay, chain} from 'popmotion';
import {CSSTransition} from 'react-transition-group';

const ANIMATION_DURATION = 180;

export default class MenuWrapperAnimation extends React.PureComponent {
    static propTypes = {
        children: PropTypes.node,
        show: PropTypes.bool.isRequired,
    };

    onEntering = (node) => {
        const nodeStyler = styler(node);

        composite({
            opacity: tween({from: 0, to: 1, duration: ANIMATION_DURATION}),
        }).start({
            update: (v) => nodeStyler.set({
                ...v,
                overflowY: 'hidden',
            }),
            complete: () => {
                nodeStyler.set({
                    overflowY: null,
                    opacity: null,
                });
            },
        });
    }

    onExiting = (node) => {
        node.style.overflowY = 'hidden';
        const nodeStyler = styler(node);
        composite({
            opacity: chain(delay(0), tween({from: 1, to: 0, duration: ANIMATION_DURATION})),
        }).start({
            update: (v) => nodeStyler.set({
                ...v,
                overflowY: 'hidden',
            }),
            complete: () => {
                nodeStyler.set({
                    overflowY: null,
                    opacity: null,
                });
            },
        });
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

