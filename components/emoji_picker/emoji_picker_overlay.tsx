// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Overlay} from 'react-bootstrap';
import memoize from 'memoize-one';

import {Emoji} from 'mattermost-redux/types/emojis';

import {popOverOverlayPosition} from 'utils/position_utils';
import {Constants} from 'utils/constants';

import EmojiPickerTabs from './emoji_picker_tabs';

export enum OverlayPositions {
    LEFT = 'left',
    RIGHT = 'right',
}

type Props = {
    show: boolean;
    container?: () => void;
    target: () => void;
    onEmojiClick: (emoji: Emoji) => void;
    onGifClick?: (gif: string) => void;
    onEmojiClose?: (e?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
    onHide: () => void;
    topOffset: number;
    rightOffset?: number;
    leftOffset?: number;
    spaceRequiredAbove?: number;
    spaceRequiredBelow?: number;
    enableGifPicker?: boolean;
    defaultHorizontalPosition?: OverlayPositions;
}

type Location = 'RHS' | 'CENTER';

export const SpaceRequirement: Record<Location, {ABOVE: number; BELOW: number}> = {

    // An emoji picker in the center channel is contained within the post list, so it needs space
    // above for the channel header and below for the post textbox
    CENTER: {
        ABOVE: 476,
        BELOW: 497,
    },

    // An emoji picker in the RHS isn't constrained by the RHS, so it just needs space to fit
    // the emoji picker itself
    RHS: {
        ABOVE: 420,
        BELOW: 420,
    },
};

const EmojiPickerOverlay = ({
    show,
    container,
    target,
    onEmojiClick,
    onEmojiClose,
    onGifClick,
    onHide,
    topOffset,
    rightOffset,
    leftOffset,
    spaceRequiredAbove = SpaceRequirement.CENTER.ABOVE,
    spaceRequiredBelow = SpaceRequirement.CENTER.BELOW,
    enableGifPicker = false,
    defaultHorizontalPosition = OverlayPositions.RIGHT,
}: Props) => {
    // Reasonable defaults calculated from from the center channel
    // static defaultProps = {
    //     spaceRequiredAbove: EmojiPickerOverlay.CENTER_SPACE_REQUIRED_ABOVE,
    //     spaceRequiredBelow: EmojiPickerOverlay.CENTER_SPACE_REQUIRED_BELOW,
    //     enableGifPicker: false,
    // };

    const emojiPickerPosition = memoize((emojiTrigger) => {
        let calculatedRightOffset = Constants.DEFAULT_EMOJI_PICKER_RIGHT_OFFSET;

        if (emojiTrigger) {
            calculatedRightOffset = window.innerWidth - emojiTrigger.getBoundingClientRect().left - Constants.DEFAULT_EMOJI_PICKER_LEFT_OFFSET;

            if (calculatedRightOffset < Constants.DEFAULT_EMOJI_PICKER_RIGHT_OFFSET) {
                calculatedRightOffset = Constants.DEFAULT_EMOJI_PICKER_RIGHT_OFFSET;
            }
        }

        return calculatedRightOffset;
    });

    const getPlacement = memoize((target, spaceRequiredAbove, spaceRequiredBelow, defaultHorizontalPosition) => {
        if (target) {
            const targetBounds = target.getBoundingClientRect();
            return popOverOverlayPosition(targetBounds, window.innerHeight, spaceRequiredAbove, spaceRequiredBelow, defaultHorizontalPosition);
        }

        return 'top';
    });

    const calculatedRightOffset = rightOffset ?? emojiPickerPosition(target());
    const placement = getPlacement(target(), spaceRequiredAbove, spaceRequiredBelow, defaultHorizontalPosition);

    return (
        <Overlay
            show={show}
            placement={placement}
            rootClose={true}
            container={container}
            onHide={onHide}
            target={target}
            animation={false}
        >
            <EmojiPickerTabs
                enableGifPicker={enableGifPicker}
                onEmojiClose={onEmojiClose}
                onEmojiClick={onEmojiClick}
                onGifClick={onGifClick}
                rightOffset={calculatedRightOffset}
                topOffset={topOffset}
                leftOffset={leftOffset}
            />
        </Overlay>
    );
};

export default EmojiPickerOverlay;
