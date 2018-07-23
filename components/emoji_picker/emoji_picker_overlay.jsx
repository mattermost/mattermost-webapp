// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Overlay} from 'react-bootstrap';

import EmojiPickerTabs from './emoji_picker_tabs.jsx';

export default class EmojiPickerOverlay extends React.PureComponent {
    static propTypes = {
        show: PropTypes.bool.isRequired,
        container: PropTypes.func,
        target: PropTypes.func.isRequired,
        onEmojiClick: PropTypes.func.isRequired,
        onGifClick: PropTypes.func,
        onHide: PropTypes.func.isRequired,
        rightOffset: PropTypes.number,
        topOffset: PropTypes.number,
        spaceRequiredAbove: PropTypes.number,
        spaceRequiredBelow: PropTypes.number,
        enableGifPicker: PropTypes.bool,
    }

    // Reasonable defaults calculated from from the center channel
    static defaultProps = {
        spaceRequiredAbove: 422,
        spaceRequiredBelow: 436,
        enableGifPicker: false,
    }

    constructor(props) {
        super(props);

        this.state = {
            placement: 'top',
        };
    }

    UNSAFE_componentWillUpdate(nextProps) { // eslint-disable-line camelcase
        if (nextProps.show && !this.props.show) {
            const targetBounds = nextProps.target().getBoundingClientRect();

            let placement;
            if (targetBounds.top > nextProps.spaceRequiredAbove) {
                placement = 'top';
            } else if (window.innerHeight - targetBounds.bottom > nextProps.spaceRequiredBelow) {
                placement = 'bottom';
            } else {
                placement = 'left';
            }

            this.setState({placement});
        }
    }

    render() {
        return (
            <Overlay
                show={this.props.show}
                placement={this.state.placement}
                rootClose={true}
                container={this.props.container}
                onHide={this.props.onHide}
                target={this.props.target}
                animation={false}
            >
                <EmojiPickerTabs
                    enableGifPicker={this.props.enableGifPicker}
                    onEmojiClick={this.props.onEmojiClick}
                    onGifClick={this.props.onGifClick}
                    rightOffset={this.props.rightOffset}
                    topOffset={this.props.topOffset}
                />
            </Overlay>
        );
    }
}
