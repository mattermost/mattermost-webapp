// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import { Tooltip } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { getCurrentUser, getUser } from 'mattermost-redux/selectors/entities/users';

import OverlayTrigger from 'components/overlay_trigger';
import RenderEmoji from 'components/emoji/render_emoji';

import Constants from 'utils/constants';
import { GlobalState } from 'types/store';

interface ComponentProps {
    emojiSize?: number;
    showTooltip?: boolean;
    tooltipDirection?: 'top' | 'right' | 'bottom' | 'left';
    userID?: string
}

const CustomStatusEmoji = (props: ComponentProps) => {
    const { emojiSize, showTooltip, tooltipDirection, userID } = props;
    const currentUser = useSelector((state: GlobalState) => {
        return userID ? getUser(state, userID) : getCurrentUser(state)
    });
    if (!(currentUser && currentUser.props && currentUser.props.customStatus)) {
        return null;
    }

    const customStatus = JSON.parse(currentUser.props.customStatus);
    const statusEmoji = (
        <RenderEmoji
            emoji={customStatus.emoji}
            size={emojiSize || 16}
        />
    );

    let status = statusEmoji;
    if (showTooltip) {
        status = (
            <OverlayTrigger
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement={tooltipDirection || 'top'}
                overlay={
                    <Tooltip id='custom-status'>
                        <div className='custom-status'>
                            {statusEmoji}
                            <span className='custom-status-text'>
                                {customStatus.text}
                            </span>
                        </div>
                    </Tooltip>
                }
            >
                <span className="custom-status-emoticon">
                    {statusEmoji}
                </span>
            </OverlayTrigger>
        );
    }

    return status;
};

export default CustomStatusEmoji;
