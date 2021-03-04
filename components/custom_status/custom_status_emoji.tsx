// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useEffect} from 'react';
import {Tooltip} from 'react-bootstrap';
import {useDispatch, useSelector} from 'react-redux';

import {getCustomEmojiByName} from 'mattermost-redux/actions/emojis';
import {getCustomEmojisByName as selectCustomEmojisByName} from 'mattermost-redux/selectors/entities/emojis';

import OverlayTrigger from 'components/overlay_trigger';
import RenderEmoji from 'components/emoji/render_emoji';

import {makeGetCustomStatus, isCustomStatusEnabled} from 'selectors/views/custom_status';
import {isCustomEmojiEnabled} from 'selectors/emojis';

import {GlobalState} from 'types/store';

import Constants from 'utils/constants';
import {EmojiIndicesByAlias} from 'utils/emoji.jsx';

interface ComponentProps {
    emojiSize?: number;
    showTooltip?: boolean;
    tooltipDirection?: 'top' | 'right' | 'bottom' | 'left';
    spanStyle?: React.CSSProperties;
    emojiStyle?: React.CSSProperties;
    userID?: string;
    onClick?: () => void;
}

const CustomStatusEmoji = (props: ComponentProps) => {
    const dispatch = useDispatch();
    const getCustomStatus = makeGetCustomStatus();
    const {emojiSize, emojiStyle, spanStyle, showTooltip, tooltipDirection, userID, onClick} = props;

    const customStatusEnabled = useSelector(isCustomStatusEnabled);
    const customStatus = useSelector((state: GlobalState) => getCustomStatus(state, userID));
    const isCustomStatusSet = Boolean(customStatusEnabled && customStatus && customStatus.emoji);

    const customEmojiEnabled = useSelector(isCustomEmojiEnabled);
    const systemEmojis = EmojiIndicesByAlias;
    const customEmojisByName = useSelector(selectCustomEmojisByName);
    const nonExistentCustomEmoji = useSelector((state: GlobalState) => state.entities.emojis.nonExistentEmoji);

    useEffect(() => {
        if (!isCustomStatusSet || !customEmojiEnabled) {
            return;
        }

        if (systemEmojis.has(customStatus.emoji)) {
            // It's a system emoji, no need to fetch
            return;
        }

        if (nonExistentCustomEmoji.has(customStatus.emoji)) {
            // We've previously confirmed this is not a custom emoji
            return;
        }

        if (customEmojisByName.has(customStatus.emoji)) {
            // We have the emoji, no need to fetch
            return;
        }

        dispatch(getCustomEmojiByName(customStatus.emoji));
    }, [customStatusEnabled, customStatus, customEmojiEnabled, systemEmojis, customEmojisByName, nonExistentCustomEmoji]);

    if (!isCustomStatusSet) {
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
                            emojiStyle={{
                                marginTop: 2,
                            }}
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
            <span style={spanStyle}>
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
    spanStyle: {},
    emojiStyle: {
        marginLeft: 4,
    },
};

export default CustomStatusEmoji;
