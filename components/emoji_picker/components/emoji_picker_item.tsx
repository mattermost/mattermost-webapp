// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useMemo, useCallback} from 'react';
import {useIntl} from 'react-intl';
import cx from 'classnames';
// @ts-ignore
import {getEmojiImageUrl} from 'mattermost-redux/utils/emoji_utils';

import {Emoji, isSystemEmoji, isCustomEmoji} from '../types';

import imgTrans from 'images/img_trans.gif';

export interface EmojiPickerItemProps {
    emoji: Emoji;
    onItemClick: (emoji: Emoji) => void;
    isSelected?: boolean;
}

const EmojiPickerItem: React.FC<EmojiPickerItemProps> = ({
    emoji,
    onItemClick,
    isSelected = false,
}) => {
    const {formatMessage} = useIntl();
    const emojiName = useMemo(() => formatMessage({
        id: 'emoji_picker_item.emoji_aria_label',
        defaultMessage: '{emojiName} emoji',
    }, {
        emojiName: emoji.aliases[0].replace(/_/g, ' '),
    }), [formatMessage, emoji]);

    // FIXME: This should implemented by parent.
    const handleClick = useCallback(() => {
        onItemClick(emoji);
    }, [emoji, onItemClick]);

    return (
        <div
            className={cx(
                'emoji-picker__item',
                isSelected && 'selected',
            )}
        >
            <div data-testid='emojiItem'>
                {isSystemEmoji(emoji) && (
                    <img
                        id={`emoji-${emoji.filename}`}
                        className={cx(
                            'emojisprite',
                            `emoji-category-${emoji.category}-${emoji.batch}`,
                            `emoji-${emoji.filename}`,
                        )}
                        src={imgTrans}
                        role='button'
                        alt={'emoji image'}
                        aria-label={emojiName}
                        onClick={handleClick}
                        data-testid={emoji.aliases}
                    />
                )}
                {isCustomEmoji(emoji) && (
                    <img
                        className={'emoji-category--custom'}
                        alt={'custom emoji image'}
                        src={getEmojiImageUrl(emoji)}
                        onClick={handleClick}
                    />
                )}
            </div>
        </div>
    )
};

export default memo(EmojiPickerItem);
