// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';

import {getEmojiImageUrl} from 'mattermost-redux/utils/emoji_utils';
import {Emoji} from 'mattermost-redux/types/emojis';

type Props = {
    emoji: Emoji;
    onItemClick: (emoji: Emoji) => void;
    order?: number;
}
const EmojiItem = ({emoji, onItemClick, order}: Props) => {
    const handleClick = () => {
        onItemClick(emoji);
    };

    const itemClassName = 'post-menu__item';

    return (
        <div
            className={classNames(itemClassName, 'post-menu__emoticon')}
            onClick={handleClick}
        >
            <button
                id={`recent_reaction_${order}`}
                data-testid={itemClassName + '_emoji'}
                className='emoticon--post-menu'
                style={{backgroundImage: `url(${getEmojiImageUrl(emoji)})`, backgroundColor: 'transparent'}}
            />
        </div>
    );
};

export default EmojiItem;
