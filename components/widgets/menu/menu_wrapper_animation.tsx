// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {chain, tween, styler, action} from 'popmotion';
import {CSSTransition} from 'react-transition-group';

import {isMobile} from 'utils/utils.jsx';

const ANIMATION_DURATION = 80;

type Props = {
    children?: React.ReactNode;
    show: boolean;
}

export default class MenuWrapperAnimation extends React.PureComponent<Props> {
    private onEntering = (node: HTMLElement, isAppearing: boolean) => {
        const nodeStyler = styler(node);
        chain(
            action(({update, complete}) => {
                update({display: 'block'});
                complete();
            }),
            tween({from: {opacity: 0}, to: {opacity: 1}, duration: ANIMATION_DURATION}),
        ).start(nodeStyler.set);
    }

    private onExiting = (node: HTMLElement) => {
        const nodeStyler = styler(node);
        chain(
            tween({from: {opacity: 1}, to: {opacity: 0}, duration: ANIMATION_DURATION}),
            action(({update, complete}) => {
                update({display: 'none'});
                complete();
            }),
        ).start(nodeStyler.set);
    }

    public render() {
        return (
            <CSSTransition
                in={this.props.show}
                classNames='MenuWrapperAnimation'
                enter={true}
                exit={true}
                mountOnEnter={true}
                unmountOnExit={true}
                {...(isMobile() ? {} : {
                    onEntering: this.onEntering,
                    onExiting: this.onExiting,
                })}
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

