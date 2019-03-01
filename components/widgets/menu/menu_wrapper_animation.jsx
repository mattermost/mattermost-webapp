// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {tween, styler, composite, delay, chain} from 'popmotion';
import {CSSTransition} from 'react-transition-group';

const ANIMATION_DURATION = 80;

export default class MenuWrapperAnimation extends React.PureComponent {
    static propTypes = {
        children: PropTypes.node,
        show: PropTypes.bool.isRequired,
    };

    onEntering = (node) => {
        const maxHeight = Math.min(node.scrollHeight + 10, ((window.innerHeight - 70) * 80) / 100);
        const nodeStyler = styler(node);

        composite({
            maxHeight: tween({from: 0, to: maxHeight, duration: ANIMATION_DURATION}),
            opacity: tween({from: 0, to: 1, duration: ANIMATION_DURATION / 2}),
        }).start({
            update: (v) => nodeStyler.set({
                ...v,
                overflowY: 'hidden',
            }),
            complete: () => {
                nodeStyler.set({
                    overflowY: null,
                    maxHeight: null,
                    opacity: null,
                });
            },
        });
    }

    onExiting = (node) => {
        node.style.overflowY = 'hidden';
        const maxHeight = Math.min(node.scrollHeight + 10, ((window.innerHeight - 70) * 80) / 100);
        const nodeStyler = styler(node);
        composite({
            maxHeight: tween({from: maxHeight, to: 0, duration: ANIMATION_DURATION}),
            opacity: chain(delay(ANIMATION_DURATION / 2), tween({from: 1, to: 0, duration: ANIMATION_DURATION / 2})),
        }).start({
            update: (v) => nodeStyler.set({
                ...v,
                overflowY: 'hidden',
            }),
            complete: () => {
                nodeStyler.set({
                    overflowY: null,
                    maxHeight: null,
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

