// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {Tooltip} from 'react-bootstrap';

import {UserProfile} from 'mattermost-redux/types/users';
import {getEmojiImageUrl} from 'mattermost-redux/utils/emoji_utils';

import OverlayTrigger from 'components/overlay_trigger';

import Constants from 'utils/constants';
import EmojiMap from 'utils/emoji_map';

interface ComponentProps {
    currentUser: UserProfile;
    emojiMap: EmojiMap;
    emojiSize?: number;
    showTooltip?: boolean;
    tooltipDirection?: 'top' | 'right' | 'bottom' | 'left';
}

const CustomStatusEmoji = ({currentUser, emojiMap, tooltipDirection = 'bottom', showTooltip = false, emojiSize = 16}: ComponentProps) => {
    if (!(currentUser && currentUser.props && currentUser.props.customStatus)) {
        return null;
    }

    const customStatus = JSON.parse(currentUser.props.customStatus);
    const emojiImageUrl = getEmojiImageUrl(emojiMap.get(customStatus.emoji));
    const statusEmoji = (
        <span
            className='emoticon'
            alt={`:${customStatus.emoji}:`}
            data-emoticon={customStatus.emoji}
            style={{
                backgroundImage: `url(${emojiImageUrl})`,
                backgroundSize: emojiSize,
            }}
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
