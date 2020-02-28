// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable react/prop-types */

import React, {useCallback, MouseEventHandler} from 'react';
import cx from 'classnames';

import {EmojiCategory} from '../utils';

export interface EmojiPickerCategoryProps {
    category: EmojiCategory;
    icon: React.ReactNode;
    onCategoryClick: (category: EmojiCategory) => void;
    selected: boolean;
    enable: boolean;
}

const EmojiPickerCategory: React.FC<EmojiPickerCategoryProps> = ({
    category,
    icon,
    onCategoryClick,
    selected,
    enable,
}) => {
    // FIXME: category & onCategoryClick either is prop from parent.
    // So this component shouldn't implement this here.
    const handleClick = useCallback<MouseEventHandler<HTMLAnchorElement>>((e) => {
        e.preventDefault();
        onCategoryClick(category);
    }, [category, onCategoryClick]);

    return (
        <a
            className={cx(
                'emoji-picker__category',
                selected && 'emoji-picker__category--selected',
                !enable && 'disable',
            )}
            href='#'
            onClick={handleClick}
            aria-label={category}
        >
            {icon}
        </a>
    );
};

export default EmojiPickerCategory;
