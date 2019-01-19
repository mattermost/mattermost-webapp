// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import PropTypes from 'prop-types';
import React from 'react';
import {RootCloseWrapper} from 'react-overlays';

export default class CustomMenu extends React.PureComponent {
    static propTypes = {
        open: PropTypes.bool,
        children: PropTypes.node,
        onClose: PropTypes.func.isRequired,
        rootCloseEvent: PropTypes.oneOf(['click', 'mousedown']),
    }

    handleRootClose = () => {
        this.props.onClose();
    }

    render() {
        const {
            open,
            rootCloseEvent,
            children,
        } = this.props;

        return (
            <RootCloseWrapper
                disabled={!open}
                onRootClose={this.handleRootClose}
                event={rootCloseEvent}
            >
                <ul
                    role='menu'
                    className='dropdown-menu channel-header_plugin-dropdown'
                >
                    {children}
                </ul>
            </RootCloseWrapper>
        );
    }
}
