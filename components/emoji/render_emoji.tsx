// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {useSelector} from 'react-redux';

import {getEmojiImageUrl} from 'mattermost-redux/utils/emoji_utils';

import {getEmojiMap} from 'selectors/emojis';
import {GlobalState} from 'types/store';
import GIFPlayer from 'components/gif_player';
import {get} from 'mattermost-redux/selectors/entities/preferences';
import {Preferences} from 'utils/constants';

interface ComponentProps {
    emojiName: string;
    size?: number;
    emojiStyle?: React.CSSProperties;
    onClick?: () => void;
}

const RenderEmoji = ({emojiName, emojiStyle, size, onClick}: ComponentProps) => {
    const emojiMap = useSelector((state: GlobalState) => getEmojiMap(state));
    const shouldPlay = useSelector((state: GlobalState) => get(state, Preferences.CATEGORY_DISPLAY_SETTINGS, Preferences.AUTOPLAY_GIF_AND_EMOJI, Preferences.LINK_PREVIEW_DISPLAY_DEFAULT),
    );

    if (!emojiName) {
        return null;
    }

    const emojiFromMap = emojiMap.get(emojiName);
    if (!emojiFromMap) {
        return null;
    }
    const emojiImageUrl = getEmojiImageUrl(emojiFromMap);

    if (shouldPlay === 'true') {
        return (
            <span
                onClick={onClick}
                className='emoticon'
                title={`:${emojiName}:`}
                data-emoticon={emojiName}
                style={{
                    backgroundImage: `url(${emojiImageUrl})`,
                    backgroundSize: 'contain',
                    height: size,
                    width: size,
                    maxHeight: size,
                    maxWidth: size,
                    minHeight: size,
                    minWidth: size,
                    overflow: 'hidden',
                    ...emojiStyle,
                }}
            />
        );
    }
    return (
        <div
            onClick={onClick}
            className='emoticon'
            title={`:${emojiName}:`}
            data-emoticon={emojiName}
            style={{
                backgroundSize: 'contain',
                height: size,
                width: size,
                maxHeight: size,
                maxWidth: size,
                minHeight: size,
                minWidth: size,
                overflow: 'hidden',
                ...emojiStyle}}
        >
            <GIFPlayer
                propagation={true}
                gif={emojiImageUrl}
                autoPlay={false}
            />
        </div>);
};

RenderEmoji.defaultProps = {
    emoji: '',
    emojiStyle: {},
    size: 16,
};

export default React.memo(RenderEmoji);
