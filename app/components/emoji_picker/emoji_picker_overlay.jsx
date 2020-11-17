// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Overlay} from 'react-bootstrap';

import {popOverOverlayPosition} from 'utils/position_utils.tsx';
import {Constants} from 'utils/constants';

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
        topOffset: PropTypes.number,
        rightOffset: PropTypes.number,
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
        this.state = {};
    }

    static emojiPickerPosition(props) {
        const emojiTrigger = props.target();

        if (typeof props.rightOffset !== 'undefined') {
            return props.rightOffset;
        }

        let rightOffset = Constants.DEFAULT_EMOJI_PICKER_RIGHT_OFFSET;
        if (emojiTrigger) {
            rightOffset = window.innerWidth - emojiTrigger.getBoundingClientRect().left - Constants.DEFAULT_EMOJI_PICKER_LEFT_OFFSET;

            if (rightOffset < Constants.DEFAULT_EMOJI_PICKER_RIGHT_OFFSET) {
                rightOffset = Constants.DEFAULT_EMOJI_PICKER_RIGHT_OFFSET;
            }
        }

        return rightOffset;
    }

    static getPlacement(props) {
        const target = props.target();
        if (target) {
            const targetBounds = target.getBoundingClientRect();
            return popOverOverlayPosition(targetBounds, window.innerHeight, props.spaceRequiredAbove, props.spaceRequiredBelow);
        }

        return 'top';
    }

    static getDerivedStateFromProps(props) {
        return {
            placement: EmojiPickerOverlay.getPlacement(props),
            rightOffset: EmojiPickerOverlay.emojiPickerPosition(props),
        };
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
                    onEmojiClose={this.props.onHide}
                    onEmojiClick={this.props.onEmojiClick}
                    onGifClick={this.props.onGifClick}
                    rightOffset={this.state.rightOffset}
                    topOffset={this.props.topOffset}
                />
            </Overlay>
        );
    }
}
