// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback, useMemo} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import {VariableSizeList, ListItemKeySelector} from 'react-window';

import {Emoji, EmojiCategory} from 'mattermost-redux/types/emojis';

import {NoResultsVariant} from 'components/no_results_indicator/types';

import NoResultsIndicator from 'components/no_results_indicator';

import {Categories, CategoryOrEmojiRow} from '../types';

import {SEARCH_EMOJI_CATEGORY, SEARCH_RESULTS, EMOJI_PER_ROW} from '../constants';

import {getEmojisByCategory} from '../utils';

import EmojiPickerCategoryOrEmojiRow from './emoji_picker_category_or_emoji_row';

// If this changes, the spaceRequiredAbove and spaceRequiredBelow props passed to the EmojiPickerOverlay must be updated
const EMOJI_CONTAINER_HEIGHT = 290;
const EMOJI_PICKER_ITEMS_STYLES = {
    height: EMOJI_CONTAINER_HEIGHT,
};

interface Props {
    filter: string;
    categories: Categories;
    allEmojis: Record<string, Emoji>;
    recentEmojis: string[];
}

const EmojiPickerCurrentResults = ({filter, categories, allEmojis, recentEmojis}: Props) => {
    const categoryNamesArray = useMemo(() => {
        if (filter.length) {
            return [SEARCH_RESULTS];
        }

        return Object.keys(categories);
    }, [filter, categories]);

    // Create an array of category names and emoji to be rendered as rows
    const [categoryOrEmojisRows, categoryOrEmojisRowsCount] = useMemo(() => {
        const categoriesAndEmojis: CategoryOrEmojiRow[] = [];

        categoryNamesArray.forEach((categoryName) => {
            const category = filter.length ? SEARCH_EMOJI_CATEGORY.searchResults : categories[categoryName as EmojiCategory];
            const emojis = getEmojisByCategory(
                allEmojis,
                categories,
                category.name,
                filter,
                recentEmojis,
            );

            categoriesAndEmojis.push({
                type: 'categoryHeaderRow',
                row: category.name,
            });

            // Create `EMOJI_PER_ROW` row lenght array of emojis
            let emojisIndividualRow: Emoji[] = [];
            emojis.forEach((emoji, index) => {
                emojisIndividualRow.push(emoji);
                if ((index + 1) % EMOJI_PER_ROW === 0) {
                    categoriesAndEmojis.push({
                        type: 'emojisRow',
                        row: emojisIndividualRow,
                    });
                    emojisIndividualRow = [];
                }
            });

            // If there are emojis left over that is less than `EMOJI_PER_ROW`, add them to the previous row
            if (emojisIndividualRow.length) {
                categoriesAndEmojis.push({
                    type: 'emojisRow',
                    row: emojisIndividualRow,
                });
            }
        });

        return [categoriesAndEmojis, categoriesAndEmojis.length];
    }, [filter, categories, allEmojis, recentEmojis]);

    // when filter is applied, If there is only one category (search) and it is empty, that means no results found for search
    const isSearchResultsEmpty = useMemo(() => {
        return filter.length !== 0 && categoryOrEmojisRowsCount === 1 && categoryOrEmojisRows[0].row === SEARCH_RESULTS;
    }, [filter, categoryOrEmojisRows]);

    // Function to create unique key for each row
    const getItemKey = useCallback((index: Parameters<ListItemKeySelector>[0], rowsData: Parameters<ListItemKeySelector<CategoryOrEmojiRow[]>>[1]) => {
        const row = rowsData[index];
        if (row.type === 'categoryHeaderRow') {
            return row.row as string;
        }

        const emojisRow = row.row as Emoji[];
        const emojiNamesArray = emojisRow.map((emoji) => emoji.name);
        return emojiNamesArray.join('--');
    }, []);

    // Function to return the height of each row
    const getItemSize = useCallback((index: number) => {
        if (categoryOrEmojisRows[index].type === 'categoryHeaderRow') {
            return 26;
        }

        return 36; // as per .emoji-picker__item height in _emoticons.scss
    }, [categoryOrEmojisRows]);

    if (isSearchResultsEmpty) {
        return (
            <NoResultsIndicator
                variant={NoResultsVariant.ChannelSearch}
                titleValues={{channelName: `"${filter}"`}}
            />
        );
    }

    return (
        <div
            className='emoji-picker__items'
            style={EMOJI_PICKER_ITEMS_STYLES}
        >
            <div className='emoji-picker__container'>
                <AutoSizer>
                    {({height, width}) => (
                        <VariableSizeList
                            height={height}
                            width={width}
                            itemCount={categoryOrEmojisRowsCount}
                            itemData={categoryOrEmojisRows}
                            itemKey={getItemKey}
                            itemSize={getItemSize}
                        >
                            {EmojiPickerCategoryOrEmojiRow}
                        </VariableSizeList>
                    )}
                </AutoSizer>
            </div>
        </div>
    );
};

EmojiPickerCurrentResults.displayName = 'EmojiPickerCurrentResults';

export default memo(EmojiPickerCurrentResults);
