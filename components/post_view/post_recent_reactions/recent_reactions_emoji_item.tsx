// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';
import classNames from 'classnames';

import {getEmojiImageUrl, isSystemEmoji} from 'mattermost-redux/utils/emoji_utils';
import {Emoji} from '@mattermost/types/emojis';

type Props = {
    emoji: Emoji;
    onItemClick: (emoji: Emoji) => void;
    order?: number;
}
const EmojiItem = ({emoji, onItemClick, order}: Props) => {
    const {formatMessage} = useIntl();

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onItemClick(emoji);
    };

    const itemClassName = 'post-menu__item';

    const emojiName = isSystemEmoji(emoji) ? emoji.short_name ?? emoji.name : emoji.name;

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
                aria-label={formatMessage(
                    {
                        id: 'emoji_picker_item.emoji_aria_label',
                        defaultMessage: '{emojiName} emoji',
                    },
                    {
                        emojiName: (emojiName).replace(/_/g, ' '),
                    },
                )}
            />
        </div>
    );
};

export default EmojiItem;
