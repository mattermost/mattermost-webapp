// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {KeyboardEvent, memo} from 'react';

import {EmojiCategory} from 'mattermost-redux/types/emojis';

import {
    Categories,
    CategoryOrEmojiRow,
    NavigationDirection,
} from 'components/emoji_picker/types';

import {calculateCategoryRowIndex} from 'components/emoji_picker/utils';

import EmojiPickerCategory from 'components/emoji_picker/components/emoji_picker_category';

interface Props {
    isFiltering: boolean;
    active: EmojiCategory;
    categories: Categories;
    onClick: (categoryRowIndex: CategoryOrEmojiRow['index'], categoryName: EmojiCategory, firstEmojiId: string) => void;
    onKeyDown: (moveTo: NavigationDirection) => void;
    focusOnSearchInput: () => void;
}

function EmojiPickerCategories({
    categories,
    isFiltering,
    active,
    onClick,
    onKeyDown,
    focusOnSearchInput,
}: Props) {
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        switch (event.key) {
        case 'ArrowRight':
            event.preventDefault();
            onKeyDown(NavigationDirection.NextEmoji);
            break;
        case 'ArrowLeft':
            event.preventDefault();
            onKeyDown(NavigationDirection.PreviousEmoji);
            break;
        case 'ArrowUp':
            event.preventDefault();
            onKeyDown(NavigationDirection.PreviousEmojiRow);
            break;
        case 'ArrowDown':
            event.preventDefault();
            onKeyDown(NavigationDirection.NextEmojiRow);
            break;
        }

        focusOnSearchInput();
    };

    const activeCategory = isFiltering ? Object.keys(categories)[0] : active;

    return (
        <div
            id='emojiPickerCategories'
            className='emoji-picker__categories'
            onKeyDown={handleKeyDown}
            role='application'
        >
            {Object.keys(categories).map((categoryName) => {
                const category = categories[categoryName as EmojiCategory];

                return (
                    <EmojiPickerCategory
                        key={`${category.id}-${category.name}`}
                        category={category}
                        categoryRowIndex={calculateCategoryRowIndex(categories, categoryName as EmojiCategory)}
                        onClick={onClick}
                        selected={activeCategory === category.name}
                        enable={!isFiltering}
                    />
                );
            },

            )}
        </div>
    );
}

export default memo(EmojiPickerCategories);
