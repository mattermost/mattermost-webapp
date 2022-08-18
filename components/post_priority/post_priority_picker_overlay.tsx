// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {Overlay} from 'react-bootstrap';
import memoize from 'memoize-one';

import {PostPriority} from '@mattermost/types/posts';

import {popOverOverlayPosition} from 'utils/position_utils';
import {Constants} from 'utils/constants';

import PostPriorityPicker from './post_priority_picker';

type Props = {
    show: boolean;
    priority?: PostPriority;
    target: () => React.RefObject<HTMLButtonElement> | React.ReactInstance | null;
    onApply: (props: {priority: PostPriority|undefined}) => void;
    onHide: () => void;
    defaultHorizontalPosition: 'left'|'right';
};

const SPACE_REQUIRED_ABOVE = 476;
const SPACE_REQUIRED_BELOW = 497;

function PostPriorityPickerOverlay({
    show,
    priority,
    target,
    onApply,
    onHide,
    defaultHorizontalPosition,
}: Props) {
    const pickerPosition = memoize((trigger, show) => {
        if (show && trigger) {
            return trigger.getBoundingClientRect().right - Constants.DEFAULT_EMOJI_PICKER_LEFT_OFFSET;
        }
        return 0;
    });

    const getPlacement = memoize((target, defaultHorizontalPosition, show) => {
        if (!show) {
            return 'top';
        }

        if (target) {
            const targetBounds = target.getBoundingClientRect();
            return popOverOverlayPosition(targetBounds, window.innerHeight, SPACE_REQUIRED_ABOVE, SPACE_REQUIRED_BELOW, defaultHorizontalPosition);
        }

        return 'top';
    });

    const offset = pickerPosition(target(), show);
    const placement = getPlacement(target(), defaultHorizontalPosition, show);

    return (
        <Overlay
            show={show}
            placement={placement}
            rootClose={true}
            onHide={onHide}
            target={target}
            animation={false}
        >
            <PostPriorityPicker
                priority={priority}
                leftOffset={offset}
                onApply={onApply}
                topOffset={-7}
                placement={placement}
                onClose={onHide}
            />
        </Overlay>
    );
}

export default memo(PostPriorityPickerOverlay);
