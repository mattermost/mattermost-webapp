// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {Tooltip} from 'react-bootstrap';

import {UserProfile} from 'mattermost-redux/types/users';

import OverlayTrigger from 'components/overlay_trigger';
import ShowEmoji from 'components/emoji/show_emoji';

import Constants from 'utils/constants';

interface ComponentProps {
    currentUser: UserProfile;
    emojiSize?: number;
    showTooltip?: boolean;
    tooltipDirection?: 'top' | 'right' | 'bottom' | 'left';
}

const CustomStatusEmoji = ({currentUser, tooltipDirection = 'bottom', showTooltip = false, emojiSize = 16}: ComponentProps) => {
    if (!(currentUser && currentUser.props && currentUser.props.customStatus)) {
        return null;
    }

    const customStatus = JSON.parse(currentUser.props.customStatus);
    const statusEmoji = (
        <ShowEmoji
            emoji={customStatus.emoji}
            size={emojiSize}
        />
    );

    let status = statusEmoji;
    if (showTooltip) {
        status = (
            <OverlayTrigger
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement={tooltipDirection}
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
                {statusEmoji}
            </OverlayTrigger>
        );
    }

    return status;
};

export default CustomStatusEmoji;
