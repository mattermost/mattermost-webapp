// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Overlay} from 'react-bootstrap';
import memoize from 'memoize-one';

import {popOverOverlayPosition} from 'utils/position_utils';
import {Constants} from 'utils/constants';

import PostPriorityPicker from './post_priority_picker';

type Props = {
    show: boolean;
    priority: ''|'important'|'urgent';
    target: () => React.RefObject<HTMLButtonElement> | React.ReactInstance | null;
    onApply: (props: {priority: string}) => void;
    onHide: () => void;
    defaultHorizontalPosition: 'left'|'right';
};

const SPACE_REQUIRED_ABOVE = 476;
const SPACE_REQUIRED_BELOW = 497;

export default class PostPriorityPickerOverlay extends React.PureComponent<Props> {
    pickerPosition = memoize((trigger, show) => {
        if (show && trigger) {
            return trigger.getBoundingClientRect().right - Constants.DEFAULT_EMOJI_PICKER_LEFT_OFFSET;
        }
        return 0;
    });

    getPlacement = memoize((target, defaultHorizontalPosition, show) => {
        if (!show) {
            return 'top';
        }

        if (target) {
            const targetBounds = target.getBoundingClientRect();
            return popOverOverlayPosition(targetBounds, window.innerHeight, SPACE_REQUIRED_ABOVE, SPACE_REQUIRED_BELOW, defaultHorizontalPosition);
        }

        return 'top';
    });

    render() {
        const {target, defaultHorizontalPosition, show} = this.props;

        const offset = this.pickerPosition(target(), show);
        const placement = this.getPlacement(target(), defaultHorizontalPosition, show);

        return (
            <Overlay
                show={show}
                placement={placement}
                rootClose={true}
                onHide={this.props.onHide}
                target={target}
                animation={false}
            >
                <PostPriorityPicker
                    priority={this.props.priority}
                    leftOffset={offset}
                    onApply={this.props.onApply}
                    topOffset={-7}
                    placement={placement}
                    onClose={this.props.onHide}
                />
            </Overlay>
        );
    }
}
