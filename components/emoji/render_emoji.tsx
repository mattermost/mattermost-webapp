// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {useSelector} from 'react-redux';

import {getEmojiImageUrl} from 'mattermost-redux/utils/emoji_utils';

import {getEmojiMap} from 'selectors/emojis';
import {GlobalState} from 'types/store';

interface ComponentProps {
    emoji: string;
    size?: number;
    emojiStyle?: React.CSSProperties;
}

const RenderEmoji = ({emoji, emojiStyle, size}: ComponentProps) => {
    if (!emoji) {
        return null;
    }

    const emojiMap = useSelector((state: GlobalState) => getEmojiMap(state));
    const emojiFromMap = emojiMap.get(emoji);
    if (!emojiFromMap) {
        return null;
    }
    const emojiImageUrl = getEmojiImageUrl(emojiFromMap);
    return (
        <span
            className='emoticon'
            alt={`:${emoji}:`}
            data-emoticon={emoji}
            style={{
                backgroundImage: `url(${emojiImageUrl})`,
                backgroundSize: size,
                height: size,
                width: size,
                minHeight: size,
                minWidth: size,
                ...emojiStyle,
            }}
        />
    );
};

RenderEmoji.defaultProps = {
    emoji: '',
    emojiStyle: {},
    size: 16,
};

export default RenderEmoji;
