// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {ListChildComponentProps, areEqual} from 'react-window';

import {Emoji} from 'mattermost-redux/types/emojis';

import {CategoryOrEmojiRow, EmojiCursor} from 'components/emoji_picker/types';

import {isCategoryHeaderRow} from 'components/emoji_picker/utils';
import EmojiPickerCategorySection from 'components/emoji_picker/components/emoji_picker_category_row';
import EmojiPickerItem from 'components/emoji_picker/components/emoji_picker_item';

interface Props extends ListChildComponentProps<CategoryOrEmojiRow[]> {
    cursorCategoryIndex: number;
    cursorEmojiIndex: number;
    onEmojiClick: (emoji: Emoji) => void;
    onEmojiMouseOver: (cursor: EmojiCursor) => void;
}

function EmojiPickerCategoryOrEmojiRow({index, style, data, cursorCategoryIndex, cursorEmojiIndex, onEmojiClick, onEmojiMouseOver}: Props) {
    const row = data[index];

    if (isCategoryHeaderRow(row)) {
        return (
            <EmojiPickerCategorySection
                categoryName={row.items[0].categoryName}
                style={style}
            />
        );
    }

    return (
        <div
            style={style}
            className='emoji-picker__row'
        >
            {row.items.map((emojiColumn) => {
                const emoji = emojiColumn.item;
                const isSelected = emojiColumn.categoryIndex === cursorCategoryIndex && emojiColumn.emojiIndex === cursorEmojiIndex;

                return (
                    <EmojiPickerItem
                        key={`${emojiColumn.categoryName}-${emojiColumn.emojiId}`}
                        emoji={emoji}
                        rowIndex={row.index}
                        categoryIndex={emojiColumn.categoryIndex}
                        categoryName={emojiColumn.categoryName}
                        emojiIndex={emojiColumn.emojiIndex}
                        isSelected={isSelected}
                        onClick={onEmojiClick}
                        onMouseOver={onEmojiMouseOver}
                    />
                );
            })}
        </div>
    );
}

export default memo(EmojiPickerCategoryOrEmojiRow, areEqual);
