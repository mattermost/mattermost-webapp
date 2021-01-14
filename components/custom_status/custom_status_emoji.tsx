// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {useSelector} from 'react-redux';

import {getCurrentUser, getUser} from 'mattermost-redux/selectors/entities/users';

import OverlayTrigger from 'components/overlay_trigger';
import RenderEmoji from 'components/emoji/render_emoji';
import {getCustomStatus} from 'selectors/views/custom_status';
import {GlobalState} from 'types/store';
import Constants from 'utils/constants';

interface ComponentProps {
    emojiSize?: number;
    showTooltip?: boolean;
    tooltipDirection?: 'top' | 'right' | 'bottom' | 'left';
    emojiStyle?: React.CSSProperties;
    userID?: string;
}

const CustomStatusEmoji = (props: ComponentProps) => {
    const {emojiSize, emojiStyle, showTooltip, tooltipDirection, userID} = props;
    const currentUser = useSelector((state: GlobalState) => {
        return userID ? getUser(state, userID) : getCurrentUser(state);
    });
    const customStatus = useSelector((state: GlobalState) => {
        return getCustomStatus(state, userID || currentUser.id);
    });
    if (!customStatus && (customStatus.text || customStatus.emoji)) {
        return null;
    }

    const statusEmoji = (
        <RenderEmoji
            emoji={customStatus.emoji}
            size={emojiSize || 16}
            emojiStyle={emojiStyle}
        />
    );

    let status = statusEmoji;
    if (showTooltip) {
        status = (
            <OverlayTrigger
                delayShow={Constants.OVERLAY_TIME_DELAY}
                placement={tooltipDirection || 'top'}
                overlay={
                    <Tooltip id='custom-status-tooltip'>
                        <div className='custom-status'>
                            <RenderEmoji
                                emoji={customStatus.emoji}
                                size={14}
                            />
                            {' '}
                            <span className='custom-status-text'>
                                {customStatus.text}
                            </span>
                        </div>
                    </Tooltip>
                }
            >
                <span>
                    {statusEmoji}
                </span>
            </OverlayTrigger>
        );
    }

    return status;
};

export default CustomStatusEmoji;
