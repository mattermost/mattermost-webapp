// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {forwardRef, memo, useCallback} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import {FixedSizeList, ListItemKeySelector, ListOnScrollProps} from 'react-window';
import throttle from 'lodash/throttle';

import {Emoji, EmojiCategory} from 'mattermost-redux/types/emojis';

import {CategoryOrEmojiRow, EmojiCursor} from 'components/emoji_picker/types';

import {ITEM_HEIGHT, EMOJI_ROWS_OVERSCAN_COUNT, EMOJI_CONTAINER_HEIGHT} from 'components/emoji_picker/constants';

import {isCategoryHeaderRow} from 'components/emoji_picker/utils';
import EmojiPickerCategoryOrEmojiRow from 'components/emoji_picker/components/emoji_picker_category_or_emoji_row';

interface Props {
    categoryOrEmojisRows: CategoryOrEmojiRow[];
    isFiltering: boolean;
    activeCategory: EmojiCategory;
    cursorCategoryIndex: number;
    cursorEmojiIndex: number;
    setActiveCategory: (category: EmojiCategory) => void;
    onEmojiClick: (emoji: Emoji) => void;
    onEmojiMouseOver: (cursor: EmojiCursor) => void;
}

const EmojiPickerCurrentResults = forwardRef<FixedSizeList<CategoryOrEmojiRow[]>, Props>(({categoryOrEmojisRows, isFiltering, activeCategory, cursorCategoryIndex, cursorEmojiIndex, setActiveCategory, onEmojiClick, onEmojiMouseOver}: Props, ref) => {
    // Function to create unique key for each row
    const getItemKey = (index: Parameters<ListItemKeySelector>[0], rowsData: Parameters<ListItemKeySelector<CategoryOrEmojiRow[]>>[1]) => {
        const data = rowsData[index];

        if (isCategoryHeaderRow(data)) {
            const categoryRow = data.items[0];
            return `${categoryRow.categoryIndex}-${categoryRow.categoryName}`;
        }

        const emojisRow = data.items;
        const emojiNamesArray = emojisRow.map((emoji) => `${emoji.categoryIndex}-${emoji.emojiId}`);
        return emojiNamesArray.join('--');
    };

    const handleScroll = (scrollOffset: ListOnScrollProps['scrollOffset'], activeCategory: EmojiCategory, isFiltering: boolean, categoryOrEmojisRows: CategoryOrEmojiRow[]) => {
        if (isFiltering) {
            return;
        }

        const approxRowsFromTop = Math.ceil(scrollOffset / ITEM_HEIGHT);
        const closestCategory = categoryOrEmojisRows?.[approxRowsFromTop]?.items[0]?.categoryName;

        if (closestCategory === activeCategory || !closestCategory) {
            return;
        }

        setActiveCategory(closestCategory);
    };

    const throttledScroll = useCallback(throttle(({scrollOffset}: ListOnScrollProps) => {
        handleScroll(scrollOffset, activeCategory, isFiltering, categoryOrEmojisRows);
    }, 150, {leading: false, trailing: true},
    ), [activeCategory, isFiltering, categoryOrEmojisRows]);

    return (
        <div
            className='emoji-picker__items'
            style={{height: EMOJI_CONTAINER_HEIGHT}}
        >
            <div
                className='emoji-picker__container'
                role='application'
            >
                <AutoSizer>
                    {({height, width}) => (
                        <FixedSizeList
                            ref={ref}
                            height={height}
                            width={width}
                            layout='vertical'
                            overscanCount={EMOJI_ROWS_OVERSCAN_COUNT}
                            itemCount={categoryOrEmojisRows.length}
                            itemData={categoryOrEmojisRows}
                            itemKey={getItemKey}
                            itemSize={ITEM_HEIGHT}
                            onScroll={throttledScroll}
                        >
                            {({index, style, data}) => (
                                <EmojiPickerCategoryOrEmojiRow
                                    index={index}
                                    style={style}
                                    data={data}
                                    cursorCategoryIndex={cursorCategoryIndex}
                                    cursorEmojiIndex={cursorEmojiIndex}
                                    onEmojiClick={onEmojiClick}
                                    onEmojiMouseOver={onEmojiMouseOver}
                                />
                            )}
                        </FixedSizeList>
                    )}
                </AutoSizer>
            </div>
        </div>
    );
});

EmojiPickerCurrentResults.displayName = 'EmojiPickerCurrentResults';

export default memo(EmojiPickerCurrentResults);
