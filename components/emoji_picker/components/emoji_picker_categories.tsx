// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {KeyboardEvent, memo, useCallback, useMemo} from 'react';

import {EmojiCategory} from 'mattermost-redux/types/emojis';

import {RECENT_EMOJI_CATEGORY, CATEGORIES, EMOJI_PER_ROW} from '../constants';

import EmojiPickerCategory from './emoji_picker_category';

interface Props {
    recentEmojis: string[];
    filter: string;
    onClick: (categoryName: string) => void;
    selectNextEmoji: (offset?: number) => void;
    selectPrevEmoji: (offset?: number) => void;
}

function EmojiPickerCategories({
    recentEmojis,
    filter,
    onClick,
    selectNextEmoji,
    selectPrevEmoji,
}: Props) {
    const categories = useMemo(() => (recentEmojis.length ? {...RECENT_EMOJI_CATEGORY, ...CATEGORIES} : CATEGORIES), [recentEmojis]);

    const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
        switch (event.key) {
        case 'ArrowRight':
            event.preventDefault();
            selectNextEmoji();

            // this.searchInputRef?.current?.focus();
            break;
        case 'ArrowLeft':
            event.preventDefault();
            selectPrevEmoji();

            // this.searchInputRef?.current?.focus();
            break;
        case 'ArrowUp':
            event.preventDefault();
            selectPrevEmoji(EMOJI_PER_ROW);

            // this.searchInputRef?.current?.focus();
            break;
        case 'ArrowDown':
            event.preventDefault();
            selectNextEmoji(EMOJI_PER_ROW);

            // this.searchInputRef?.current?.focus();
            break;
        }
    }, [selectNextEmoji, selectPrevEmoji]);

    // change this
    // const currentCategoryName = filter ? categoryKeys[0] : categoryKeys[1];

    const emojiPickerCategories = useMemo(() => Object.keys(categories).map((categoryName) => {
        const category = categories[categoryName as EmojiCategory];

        return (
            <EmojiPickerCategory
                key={'header-' + category.name}
                category={category}
                icon={<i className={category.className}/>}
                onCategoryClick={onClick}
                selected={false} // change this
                enable={filter.length === 0}
            />
        );
    }), [categories, filter]);

    return (
        <div
            id='emojiPickerCategories'
            className='emoji-picker__categories'
            onKeyDown={handleKeyDown}
        >
            {emojiPickerCategories}
        </div>
    );
}

export default memo(EmojiPickerCategories);
