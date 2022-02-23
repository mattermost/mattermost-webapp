// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-console */

import React, {useRef, useState, useEffect, useCallback, memo, useMemo} from 'react';
import {FormattedMessage} from 'react-intl';
import type {FixedSizeList} from 'react-window';
import type InfiniteLoader from 'react-window-infinite-loader';

import {Emoji, EmojiCategory} from 'mattermost-redux/types/emojis';
import {isSystemEmoji} from 'mattermost-redux/utils/emoji_utils';

import {NoResultsVariant} from 'components/no_results_indicator/types';
import {CategoryOrEmojiRow, Categories, EmojiCursor, NavigationDirection, EmojiWithRow, EmojiRow} from 'components/emoji_picker/types';

import {CATEGORIES, RECENT_EMOJI_CATEGORY, RECENT, SMILEY_EMOTION, SEARCH_RESULTS, EMOJI_PER_ROW} from 'components/emoji_picker/constants';
import {createCategoryAndEmojiRows, getCursorProperties, getUpdatedCategoriesAndAllEmojis} from 'components/emoji_picker/utils';

import NoResultsIndicator from 'components/no_results_indicator';
import EmojiPickerPreview from 'components/emoji_picker/components/emoji_picker_preview';
import EmojiPickerSearch from 'components/emoji_picker/components/emoji_picker_search';
import EmojiPickerSkin from 'components/emoji_picker/components/emoji_picker_skin';
import EmojiPickerCategories from 'components/emoji_picker/components/emoji_picker_categories';
import EmojiPickerCustomEmojiButton from 'components/emoji_picker/components/emoji_picker_custom_emoji_button';
import EmojiPickerCurrentResults from 'components/emoji_picker/components/emoji_picker_current_results';

import type {PropsFromRedux} from './index';

interface Props extends PropsFromRedux {
    filter: string;
    visible: boolean;
    onEmojiClick: (emoji: Emoji) => void;
    handleFilterChange: (filter: string) => void;
}

const EmojiPicker = ({
    filter,
    visible,
    onEmojiClick,
    handleFilterChange,
    customEmojisEnabled = false,
    customEmojiPage = 0,
    emojiMap,
    recentEmojis,
    userSkinTone,
    currentTeamName,
    actions: {
        getCustomEmojis,
        searchCustomEmojis,
        incrementEmojiPickerPage,
        setUserSkinTone,
    },
}: Props) => {
    const getInitialActiveCategory = () => (recentEmojis.length ? RECENT : SMILEY_EMOTION);
    const [activeCategory, setActiveCategory] = useState<EmojiCategory>(getInitialActiveCategory);

    const [cursor, setCursor] = useState<EmojiCursor>({
        rowIndex: -1,
        emojiId: '',
        emoji: undefined,
    });

    // On the first load, categories doesnt contain emojiIds until later when getUpdatedCategoriesAndAllEmojis is called
    const getInitialCategories = () => (recentEmojis.length ? {...RECENT_EMOJI_CATEGORY, ...CATEGORIES} : CATEGORIES);
    const [categories, setCategories] = useState<Categories>(getInitialCategories);

    const [allEmojis, setAllEmojis] = useState<Record<string, Emoji>>({});

    const [categoryOrEmojisRows, setCategoryOrEmojisRows] = useState<CategoryOrEmojiRow[]>([]);

    // contains all emojis visible on screen sorted by category
    const [sortedEmojis, setSortedEmojis] = useState<EmojiWithRow[]>([]);

    const searchInputRef = useRef<HTMLInputElement>(null);

    const infiniteLoaderRef = React.useRef<InfiniteLoader & {_listRef: FixedSizeList<CategoryOrEmojiRow[]>}>(null);

    const shouldRunCreateCategoryAndEmojiRows = useRef<boolean>();

    useEffect(() => {
        // Delay taking focus because this briefly renders offscreen when using an Overlay
        // so focusing it immediately on mount can cause weird scrolling
        const searchFocusAnimationFrame = window.requestAnimationFrame(() => {
            searchInputRef.current?.focus();
        });

        const rootComponent = document.getElementById('root');
        rootComponent?.classList.add('emoji-picker--active');

        return () => {
            rootComponent?.classList.remove('emoji-picker--active');
            window.cancelAnimationFrame(searchFocusAnimationFrame);
        };
    }, []);

    useEffect(() => {
        shouldRunCreateCategoryAndEmojiRows.current = true;

        const [updatedCategories, updatedAllEmojis] = getUpdatedCategoriesAndAllEmojis(emojiMap, recentEmojis, userSkinTone, allEmojis);
        setAllEmojis(updatedAllEmojis);
        setCategories(updatedCategories);
    }, [emojiMap, userSkinTone, recentEmojis]);

    useEffect(() => {
        shouldRunCreateCategoryAndEmojiRows.current = false;

        const [updatedCategoryOrEmojisRows, sortedEmojisByCategory] = createCategoryAndEmojiRows(allEmojis, categories, filter, userSkinTone);

        setCategoryOrEmojisRows(updatedCategoryOrEmojisRows);
        setSortedEmojis(sortedEmojisByCategory);
    }, [filter, userSkinTone, shouldRunCreateCategoryAndEmojiRows.current]);

    // Hack for getting focus on search input when tab changes to emoji from gifs
    useEffect(() => {
        searchInputRef.current?.focus();
    }, [visible]);

    // clear out the active category on search input
    useEffect(() => {
        if (activeCategory !== getInitialActiveCategory()) {
            setActiveCategory(getInitialActiveCategory());
        }

        // eslint-disable-next-line no-underscore-dangle
        infiniteLoaderRef?.current?._listRef?.scrollToItem(0, 'start');
    }, [filter]);

    // scroll as little as possible on cursor navigation
    useEffect(() => {
        if (cursor.emojiId) {
            // eslint-disable-next-line no-underscore-dangle
            infiniteLoaderRef?.current?._listRef?.scrollToItem(cursor.rowIndex, 'auto');
        }
    }, [cursor.rowIndex]);

    const focusOnSearchInput = useCallback(() => {
        searchInputRef.current?.focus();
    }, []);

    const getEmojiById = (emojiId: string) => {
        if (!emojiId) {
            return null;
        }
        const emoji = allEmojis[emojiId] || allEmojis[emojiId.toUpperCase()] || allEmojis[emojiId.toLowerCase()];
        return emoji;
    };

    const handleCategoryClick = useCallback((categoryRowIndex: CategoryOrEmojiRow['index'], categoryName: EmojiCategory, emojiId: string) => {
        if (!categoryName || categoryName === activeCategory || !emojiId) {
            return;
        }

        setActiveCategory(categoryName);

        // eslint-disable-next-line no-underscore-dangle
        infiniteLoaderRef?.current?._listRef?.scrollToItem(categoryRowIndex, 'start');

        const cursorEmoji = getEmojiById(emojiId);
        if (cursorEmoji) {
            setCursor({
                rowIndex: categoryRowIndex + 1, // +1 because next row is the emoji row
                emojiId,
                emoji: cursorEmoji,
            });
        }
    }, [activeCategory]);

    const resetCursor = useCallback(() => {
        setCursor({
            rowIndex: -1,
            emojiId: '',
            emoji: undefined,
        });
    }, []);

    const [cursorCategory, cursorCategoryIndex, cursorEmojiIndex] = getCursorProperties(cursor.rowIndex, cursor.emojiId, categoryOrEmojisRows as EmojiRow[]);

    const handleKeyboardEmojiNavigation = (moveTo: NavigationDirection) => {
        console.log('handleKeyboardEmojiNavigation', moveTo);

        let currentCursorIndexInEmojis = -1;
        let newCursorIndex = -1;

        // If cursor is on an emoji
        if (cursor.emojiId.length !== 0) {
            currentCursorIndexInEmojis = sortedEmojis.findIndex((sortedEmoji) =>
                sortedEmoji.rowIndex === cursor.rowIndex &&
                    sortedEmoji.emojiId.toLowerCase() === cursor.emojiId.toLowerCase(),
            );

            if (currentCursorIndexInEmojis === -1) {
                newCursorIndex = 0;
            } else if (moveTo === NavigationDirection.NextEmoji && ((currentCursorIndexInEmojis + 1) < sortedEmojis.length)) {
                newCursorIndex = currentCursorIndexInEmojis + 1;
            } else if (moveTo === NavigationDirection.PreviousEmoji) {
                newCursorIndex = currentCursorIndexInEmojis - 1;
                if (newCursorIndex < 0) {
                    // If cursor was at first emoji then focus on search input on LEFT arrow press
                    focusOnSearchInput();
                }
            } else if (moveTo === NavigationDirection.NextEmojiRow && ((currentCursorIndexInEmojis + EMOJI_PER_ROW) < sortedEmojis.length)) {
                newCursorIndex = currentCursorIndexInEmojis + EMOJI_PER_ROW;
            } else if (moveTo === NavigationDirection.PreviousEmojiRow) {
                // Either we can go to previous category's last emoji or in a row above in the same category
                // todo
            }
        } else if (cursor.emojiId.length === 0 && (moveTo === NavigationDirection.NextEmoji || moveTo === NavigationDirection.NextEmojiRow)) {
            // if no cursor is selected, set the first emoji on arrows right / down
            newCursorIndex = 0;
        }

        // If newCursorIndex is less than 0, abort and do nothing
        if (newCursorIndex < 0) {
            alert('No more emojis to navigate to');
            return;
        }

        // This can be search category when filter is active and other categories when filter is inactive
        // const cursorEmojiCategory = categoryOrEmojisRows[cursor.rowIndex].items[0].categoryName;
        const newEmojiRowIndex = sortedEmojis[newCursorIndex].rowIndex;
        const newEmojiCategory = sortedEmojis[newCursorIndex].categoryName;
        const newEmojiId = sortedEmojis[newCursorIndex].emojiId;
        const newEmoji = getEmojiById(newEmojiId) as Emoji;
        console.log('keyboard nav');
        console.log({newCursorIndex, currentCursorIndexInEmojis, newEmoji, newEmojiId});
        setCursor({
            rowIndex: newEmojiRowIndex,
            emojiId: newEmojiId,
            emoji: newEmoji,
        });

        // const categoriesNames = Object.keys(getInitialCategories());

        // let newEmoji: Emoji;
        // let newEmojiId: string;

        // // we jumped to next another category
        // if ((moveTo === NavigationDirection.NextEmojiRow && categoriesNames.indexOf(newEmojiCategory) > categoriesNames.indexOf(cursorEmojiCategory)) || (
        //     moveTo === NavigationDirection.PreviousEmojiRow && categoriesNames.indexOf(newEmojiCategory) < categoriesNames.indexOf(cursorEmojiCategory))) {
        //     newEmojiId = categoryOrEmojisRows[newEmojiRowIndex].items[0].emojiId;
        //     newEmoji = categoryOrEmojisRows[newEmojiRowIndex].items[0].item as Emoji;
        // } else {
        //     newEmojiId = sortedEmojis[position].emojiId;
        //     newEmoji = getEmojiById(newEmojiId) as Emoji;
        // }
    };

    const handleEnterOnEmoji = useCallback(() => {
        const clickedEmoji = cursor.emoji;

        if (clickedEmoji) {
            onEmojiClick(clickedEmoji);
        }
    }, [cursor.emojiId]);

    const handleEmojiOnMouseOver = (cursor: EmojiCursor) => {
        console.log('handleEmojiOnMouseOver', cursor);
        setCursor(cursor);
    };

    const cursorEmojiName = useMemo(() => {
        const {emoji} = cursor;

        if (!emoji) {
            return '';
        }

        const name = isSystemEmoji(emoji) ? emoji.short_name : emoji.name;
        return name.replace(/_/g, ' ');
    }, [cursor.emojiId]);

    const areSearchResultsEmpty = filter.length !== 0 && categoryOrEmojisRows.length === 1 && categoryOrEmojisRows?.[0]?.items?.[0]?.categoryName === SEARCH_RESULTS;

    console.log('cursor', cursor);
    return (
        <div
            className='emoji-picker__inner'
            role='application'
        >
            <div
                aria-live='assertive'
                className='sr-only'
            >
                <FormattedMessage
                    id='emoji_picker_item.emoji_aria_label'
                    defaultMessage='{emojiName} emoji'
                    values={{
                        emojiName: cursorEmojiName,
                    }}
                />
            </div>
            <div className='emoji-picker__search-container'>
                <EmojiPickerSearch
                    ref={searchInputRef}
                    value={filter}
                    customEmojisEnabled={customEmojisEnabled}
                    cursorCategoryIndex={cursorCategoryIndex}
                    cursorEmojiIndex={cursorEmojiIndex}
                    focus={focusOnSearchInput}
                    onEnter={handleEnterOnEmoji}
                    onChange={handleFilterChange}
                    onKeyDown={handleKeyboardEmojiNavigation}
                    resetCursorPosition={resetCursor}
                    searchCustomEmojis={searchCustomEmojis}
                />
                <EmojiPickerSkin
                    userSkinTone={userSkinTone}
                    onSkinSelected={setUserSkinTone}
                />
            </div>
            <EmojiPickerCategories
                isFiltering={filter.length > 0}
                active={activeCategory}
                categories={categories}
                onClick={handleCategoryClick}
                onKeyDown={handleKeyboardEmojiNavigation}
                focusOnSearchInput={focusOnSearchInput}
            />
            {areSearchResultsEmpty ? (
                <NoResultsIndicator
                    variant={NoResultsVariant.ChannelSearch}
                    titleValues={{channelName: `"${filter}"`}}
                />
            ) : (
                <EmojiPickerCurrentResults
                    ref={infiniteLoaderRef}
                    isFiltering={filter.length > 0}
                    activeCategory={activeCategory}
                    categoryOrEmojisRows={categoryOrEmojisRows}
                    cursorEmojiId={cursor.emojiId}
                    cursorRowIndex={cursor.rowIndex}
                    setActiveCategory={setActiveCategory}
                    onEmojiClick={onEmojiClick}
                    onEmojiMouseOver={handleEmojiOnMouseOver}
                    getCustomEmojis={getCustomEmojis}
                    customEmojiPage={customEmojiPage}
                    incrementEmojiPickerPage={incrementEmojiPickerPage}
                    customEmojisEnabled={customEmojisEnabled}
                />
            )}
            <div className='emoji-picker__footer'>
                <EmojiPickerPreview
                    emoji={cursor.emoji}
                />
                <EmojiPickerCustomEmojiButton
                    currentTeamName={currentTeamName}
                    customEmojisEnabled={customEmojisEnabled}
                />
            </div>
        </div>
    );
};

export default memo(EmojiPicker);
