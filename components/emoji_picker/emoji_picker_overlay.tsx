// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {noop} from 'lodash';
import React, {useMemo} from 'react';
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
    target: Element | null;
    onEmojiClick: (emoji: Emoji) => void;
    onHide: () => void;
    topOffset: number;
    onEmojiClose?: (e?: React.MouseEvent<Element, MouseEvent>) => void;
    onGifClick?: (gif: string) => void;
    container?: () => void;
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
    onGifClick,
    onHide,
    topOffset,
    rightOffset,
    leftOffset,
    onEmojiClose = noop,
    spaceRequiredAbove = SpaceRequirement.CENTER.ABOVE,
    spaceRequiredBelow = SpaceRequirement.CENTER.BELOW,
    enableGifPicker = false,
    defaultHorizontalPosition = OverlayPositions.RIGHT,
}: Props) => {
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

    // this is just to prevent eslint errors from happening since passing in a function is valid and passing in a refobject is not
    const getTarget = () => target || null;

    const memoizedPlacement = useMemo(() => {
        if (!show) {
            return 'top';
        }

        if (target) {
            const targetBounds = target.getBoundingClientRect?.();
            return popOverOverlayPosition(targetBounds, window.innerHeight, spaceRequiredAbove, spaceRequiredBelow, defaultHorizontalPosition);
        }

        return 'top';
    }, [target, spaceRequiredAbove, spaceRequiredBelow, defaultHorizontalPosition, show]);

    const calculatedRightOffset = rightOffset ?? emojiPickerPosition(target);

    return (
        <Overlay
            show={show}
            placement={memoizedPlacement}
            rootClose={true}
            container={container}
            onHide={onHide}
            target={getTarget}
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
