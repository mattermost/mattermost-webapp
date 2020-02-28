// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable react/prop-types */

import React from 'react';

import EmojiPickerCategory from './emoji_picker_category';

export interface EmojiPickerCategoryListProps {
    hasRecentlyUsed: boolean;
}

export const EmojiPickerCategoryList: React.FC<EmojiPickerCategoryListProps> = ({
    hasRecentlyUsed,
}) => {
    return (
        <div
            id='emojiPickerCategories'
            className='emoji-picker__categories'
        >
            {hasRecentlyUsed && (
                <EmojiPickerCategory
                    category='recent'
                />
            )}
            <EmojiPickerCategory
                category='people'
            />
            <EmojiPickerCategory
                category='nature'
            />
            <EmojiPickerCategory
                category='foods'
            />
            <EmojiPickerCategory
                category='activity'
            />
            <EmojiPickerCategory
                category='places'
            />
            <EmojiPickerCategory
                category='objects'
            />
            <EmojiPickerCategory
                category='symbols'
            />
            <EmojiPickerCategory
                category='flags'
            />
            <EmojiPickerCategory
                category='custom'
            />
        </div>
    );
};

export default EmojiPickerCategoryList;
