// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {Fragment, memo, useMemo} from 'react';
import {ListChildComponentProps} from 'react-window';

import {EmojiCategory, Emoji} from 'mattermost-redux/types/emojis';

import {CategoryOrEmojiRow} from '../types';

import EmojiPickerCategorySection from './emoji_picker_category_section';
import EmojiPickerItem from './emoji_picker_item';

function EmojiPickerCategoryOrEmojiRow({index, style, data}: ListChildComponentProps<CategoryOrEmojiRow[]>) {
    if (data[index].type === 'categoryHeaderRow') {
        return (
            <EmojiPickerCategorySection
                categoryName={data[index].row as EmojiCategory}
                style={style}
            />
        );
    }

    const emojis = data[index].row as Emoji[];

    const emojisInARow = useMemo(() => {
        return emojis.map((emoji) => (
            <EmojiPickerItem
                key={`${index}-@-row-${emoji.name}`}
                emoji={emoji}
                // onItemOver={this.handleItemOver}
                // onItemClick={
                // this.handleItemClick
                // }
                category={emoji.category}
            />
        ));
    }, [emojis]);

    return (
        <div
            style={style}
            className='emoji-picker__row'
        >
            {emojisInARow}
        </div>
    );
}

export default memo(EmojiPickerCategoryOrEmojiRow);
