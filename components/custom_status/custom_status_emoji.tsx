// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useEffect} from 'react';
import {Tooltip} from 'react-bootstrap';
import {useDispatch, useSelector} from 'react-redux';

import {getCustomEmojis} from 'mattermost-redux/actions/emojis';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import OverlayTrigger from 'components/overlay_trigger';
import RenderEmoji from 'components/emoji/render_emoji';
import {makeGetCustomStatus, isCustomStatusEnabled} from 'selectors/views/custom_status';
import {GlobalState} from 'types/store';
import Constants from 'utils/constants';

interface ComponentProps {
    emojiSize?: number;
    showTooltip?: boolean;
    tooltipDirection?: 'top' | 'right' | 'bottom' | 'left';
    emojiStyle?: React.CSSProperties;
    userID?: string;
    onClick?: () => void;
}

const CustomStatusEmoji = (props: ComponentProps) => {
    const dispatch = useDispatch();
    const getCustomStatus = makeGetCustomStatus();
    const {emojiSize, emojiStyle, showTooltip, tooltipDirection, userID, onClick} = props;

    const isCustomEmojiEnabled = useSelector((state: GlobalState) => getConfig(state).EnableCustomEmoji === 'true');
    useEffect(() => {
        if (isCustomEmojiEnabled) {
            dispatch(getCustomEmojis());
        }
    }, [isCustomEmojiEnabled]);

    const customStatusEnabled = useSelector(isCustomStatusEnabled);
    const customStatus = useSelector((state: GlobalState) => {
        return getCustomStatus(state, userID);
    });
    if (!(customStatusEnabled && customStatus && customStatus.emoji)) {
        return null;
    }

    const statusEmoji = (
        <RenderEmoji
            emojiName={customStatus.emoji}
            size={emojiSize}
            emojiStyle={emojiStyle}
            onClick={onClick}
        />
    );

    if (!showTooltip) {
        return statusEmoji;
    }

    return (
        <OverlayTrigger
            delayShow={Constants.OVERLAY_TIME_DELAY}
            placement={tooltipDirection}
            overlay={
                <Tooltip id='custom-status-tooltip'>
                    <div className='custom-status'>
                        <RenderEmoji
                            emojiName={customStatus.emoji}
                            size={14}
                        />
                        <span
                            className='custom-status-text'
                            style={{marginLeft: 5}}
                        >
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
};

CustomStatusEmoji.defaultProps = {
    userID: '',
    emojiSize: 16,
    tooltipDirection: 'top',
    showTooltip: false,
    emojiStyle: {
        marginLeft: 4,
    },
};

export default CustomStatusEmoji;
