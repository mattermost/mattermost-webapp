// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {CSSTransition} from 'react-transition-group';

import {isMobile} from 'utils/utils.jsx';

const ANIMATION_DURATION = 80;

type Props = {
    children?: React.ReactNode;
    show: boolean;
}

export default class MenuWrapperAnimation extends React.PureComponent<Props> {
    public render() {
        if (isMobile()) {
            if (this.props.show) {
                return this.props.children;
            }

            return null;
        }

        return (
            <CSSTransition
                in={this.props.show}
                classNames='MenuWrapperAnimation'
                enter={true}
                exit={true}
                mountOnEnter={true}
                unmountOnExit={true}
                timeout={ANIMATION_DURATION}
            >
                {this.props.children}
            </CSSTransition>
        );
    }
}

