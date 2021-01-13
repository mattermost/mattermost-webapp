// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {useSelector} from 'react-redux';

import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';

import OverlayTrigger from 'components/overlay_trigger';
import RenderEmoji from 'components/emoji/render_emoji';

import Constants from 'utils/constants';
import {GlobalState} from 'types/store';

interface ComponentProps {
    emojiSize?: number;
    showTooltip?: boolean;
    tooltipDirection?: 'top' | 'right' | 'bottom' | 'left';
    emojiStyle?: React.CSSProperties;
    showText? : boolean;
}

const CustomStatusEmoji = ({tooltipDirection = 'bottom', showTooltip = false, emojiSize = 16, emojiStyle = {}, showText = false}: ComponentProps) => {
    const currentUser = useSelector((state: GlobalState) => getCurrentUser(state));
    if (!(currentUser && currentUser.props && currentUser.props.customStatus)) {
        return null;
    }

    const customStatus = JSON.parse(currentUser.props.customStatus);
    let statusEmoji = (
        <RenderEmoji
            emoji={customStatus.emoji}
            size={emojiSize}
            emojiStyle={emojiStyle}
        />
    );
    let statusText = null;
    if (showText) {
        statusText = (
            <span>
                {customStatus.text}
            </span>
        );
    }

    if (showTooltip) {
        statusEmoji = (
            <OverlayTrigger
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement={tooltipDirection}
                overlay={
                    <Tooltip id='custom-status-tooltip'>
                        <div className='custom-status'>
                            {statusEmoji}
                            <span className='custom-status-text'>
                                {customStatus.text}
                            </span>
                        </div>
                    </Tooltip>
                }
            >
                {statusEmoji}
            </OverlayTrigger>
        );
    }
    return (
        <>
            {statusEmoji}
            {statusText}
        </>
    );
};

export default CustomStatusEmoji;
