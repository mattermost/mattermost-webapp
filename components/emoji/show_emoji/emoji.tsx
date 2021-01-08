// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

import {getEmojiImageUrl} from 'mattermost-redux/utils/emoji_utils';

import EmojiMap from 'utils/emoji_map';

interface ComponentProps {
    emoji: string;
    emojiMap: EmojiMap;
    size?: number;
}

const Emoji = ({emoji, emojiMap, size = 16}: ComponentProps) => {
    if (!emoji) {
        return null;
    }

    const emojiImageUrl = getEmojiImageUrl(emojiMap.get(emoji));
    return (
        <span
            className='emoticon'
            alt={`:${emoji}:`}
            data-emoticon={emoji}
            style={{
                backgroundImage: `url(${emojiImageUrl})`,
                backgroundSize: size,
            }}
        />
    );
};

export default Emoji;
