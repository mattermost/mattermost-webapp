// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {CSSTransition} from 'react-transition-group';

const ANIMATION_DURATION = 350;

export default class MobileChannelHeaderDropdownAnimation extends React.PureComponent {
    static propTypes = {
        children: PropTypes.node,
        show: PropTypes.bool.isRequired,
    };

    render() {
        return (
            <CSSTransition
                in={this.props.show}
                classNames='mobile-channel-header-dropdown'
                enter={true}
                exit={true}
                mountOnEnter={true}
                unmountOnExit={true}
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

