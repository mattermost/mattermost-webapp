// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {ListChildComponentProps, areEqual} from 'react-window';

import {Emoji} from 'mattermost-redux/types/emojis';

import {CategoryOrEmojiRow, EmojiCursor} from 'components/emoji_picker/types';

import {CATEGORY_HEADER_ROW, EMOJIS_ROW} from 'components/emoji_picker/constants';

import EmojiPickerCategorySection from 'components/emoji_picker/components/emoji_picker_category_row';
import EmojiPickerItem from 'components/emoji_picker/components/emoji_picker_item';

interface Props extends ListChildComponentProps<CategoryOrEmojiRow[]> {
    cursorCategoryIndex: number;
    cursorEmojiIndex: number;
    onEmojiClick: (emoji: Emoji) => void;
    onEmojiMouseOver: (cursor: EmojiCursor) => void;
}

function EmojiPickerCategoryOrEmojiRow({index, style, data, cursorCategoryIndex, cursorEmojiIndex, onEmojiClick, onEmojiMouseOver}: Props) {
    if (data[index].type === CATEGORY_HEADER_ROW) {
        return (
            <EmojiPickerCategorySection
                categoryName={data[index].items[0].categoryName}
                style={style}
            />
        );
    }

    const emojisRow = data[index].items as CategoryOrEmojiRow<typeof EMOJIS_ROW>['items'];
    const rowIndex = data[index].index;

    if (data[index].type === EMOJIS_ROW) {
        return (
            <div
                style={style}
                className='emoji-picker__row'
            >
                {emojisRow.map((emojiColumn) => {
                    const emoji = emojiColumn.item;
                    const isSelected = emojiColumn.categoryIndex === cursorCategoryIndex && emojiColumn.emojiIndex === cursorEmojiIndex;

                    return (
                        <EmojiPickerItem
                            key={`${emojiColumn.categoryName}-${emojiColumn.emojiId}`}
                            emoji={emoji}
                            rowIndex={rowIndex}
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

    return null;
}

export default memo(EmojiPickerCategoryOrEmojiRow, areEqual);
