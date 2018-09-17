// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Overlay} from 'react-bootstrap';

import EmojiPickerTabs from './emoji_picker_tabs.jsx';

export default class EmojiPickerOverlay extends React.PureComponent {
    // An emoji picker in the center channel is contained within the post list, so it needs space
    // above for the channel header and below for the post textbox
    static CENTER_SPACE_REQUIRED_ABOVE = 476;
    static CENTER_SPACE_REQUIRED_BELOW = 497;

    // An emoji picker in the RHS isn't constrained by the RHS, so it just needs space to fit
    // the emoji picker itself
    static RHS_SPACE_REQUIRED_ABOVE = 420;
    static RHS_SPACE_REQUIRED_BELOW = 420;

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
    };

    // Reasonable defaults calculated from from the center channel
    static defaultProps = {
        spaceRequiredAbove: EmojiPickerOverlay.CENTER_SPACE_REQUIRED_ABOVE,
        spaceRequiredBelow: EmojiPickerOverlay.CENTER_SPACE_REQUIRED_BELOW,
        enableGifPicker: false,
    };

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
