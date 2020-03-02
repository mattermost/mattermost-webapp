// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable react/prop-types */

import React from 'react';
import cx from 'classnames';
import {EmojiCategory} from 'mattermost-redux/types/emojis';

import {useEmojiCategoryIconComponent} from './emoji_picker_category_icon';

export interface EmojiPickerCategoryProps {
    category: EmojiCategory;
    selected?: boolean;
    enable?: boolean;
}

const EmojiPickerCategory: React.FC<EmojiPickerCategoryProps> = ({
    category,
    selected = false,
    enable = true,
}) => {
    const EmojiCategoryIcon = useEmojiCategoryIconComponent(category);

    return (
        <button
            className={cx(
                'emoji-picker__category',
                selected && 'emoji-picker__category--selected',
                !enable && 'disable',
            )}
            aria-label={category}
        >
            <EmojiCategoryIcon/>
        </button>
    );
};

export default EmojiPickerCategory;
