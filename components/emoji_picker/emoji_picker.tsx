// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, useState, useEffect, useCallback, memo, useMemo} from 'react';
import {FormattedMessage} from 'react-intl';
import type {FixedSizeList} from 'react-window';

import {Emoji, EmojiCategory} from 'mattermost-redux/types/emojis';

import {NoResultsVariant} from 'components/no_results_indicator/types';
import {CategoryOrEmojiRow, Categories, EmojiCursor, NavigationDirection} from 'components/emoji_picker/types';

import {CATEGORIES, RECENT_EMOJI_CATEGORY, RECENT, SMILEY_EMOTION, SEARCH_RESULTS, EMOJI_PER_ROW, EMOJIS_ROW} from 'components/emoji_picker/constants';
import {createCategoryAndEmojiRows, getAllEmojis} from 'components/emoji_picker/utils';

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
        categoryIndex: -1,
        categoryName: '',
        emojiIndex: -1,
        emoji: undefined,
    });

    const getInitialCategories = () => (recentEmojis.length ? {...RECENT_EMOJI_CATEGORY, ...CATEGORIES} : CATEGORIES);
    const [categories, setCategories] = useState<Categories>(getInitialCategories);

    const [allEmojis, setAllEmojis] = useState<Record<string, Emoji>>({});

    const [categoryOrEmojisRows, setCategoryOrEmojisRows] = useState<CategoryOrEmojiRow[]>([]);

    const searchInputRef = useRef<HTMLInputElement>(null);

    const resultsListRef = useRef<FixedSizeList<CategoryOrEmojiRow[]>>(null);

    const shouldRunCreateCategoryAndEmojiRows = useRef<boolean>();

    const categoryNames = Object.keys(categories) as EmojiCategory[];

    useEffect(() => {
        // Delay taking focus because this briefly renders offscreen when using an Overlay
        // so focusing it immediately on mount can cause weird scrolling
        window.requestAnimationFrame(() => {
            searchInputRef.current?.focus();
        });

        const rootComponent = document.getElementById('root');
        rootComponent?.classList.add('emoji-picker--active');

        return () => {
            rootComponent?.classList.remove('emoji-picker--active');
        };
    }, []);

    useEffect(() => {
        shouldRunCreateCategoryAndEmojiRows.current = true;

        const [updatedCategories, updatedAllEmojis] = getAllEmojis(emojiMap, recentEmojis, userSkinTone, categories, allEmojis);
        setAllEmojis(updatedAllEmojis);
        setCategories(updatedCategories);
    }, [emojiMap, userSkinTone, recentEmojis]);

    useEffect(() => {
        shouldRunCreateCategoryAndEmojiRows.current = false;

        const updatedCategoryOrEmojisRows = createCategoryAndEmojiRows(allEmojis, categories, filter, userSkinTone);
        setCategoryOrEmojisRows(updatedCategoryOrEmojisRows);
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

        resultsListRef?.current?.scrollToItem(0, 'start');
    }, [filter]);

    // scroll as little as possible on cursor navigation
    useEffect(() => {
        if (cursor.emoji) {
            resultsListRef?.current?.scrollToItem(cursor.rowIndex, 'auto');
        }
    }, [cursor.rowIndex]);

    const focusOnSearchInput = useCallback(() => {
        searchInputRef.current?.focus();
    }, []);

    const getEmojiById = (emojiId: string) => {
        if (!emojiId) {
            return null;
        }

        const emoji = allEmojis[emojiId];
        return emoji;
    };

    const handleCategoryClick = useCallback((categoryRowIndex: CategoryOrEmojiRow['index'], categoryIndex: number, categoryName: EmojiCategory, emojiId: string) => {
        if (!categoryName || categoryName === activeCategory) {
            return;
        }

        setActiveCategory(categoryName);
        resultsListRef?.current?.scrollToItem(categoryRowIndex, 'start');

        const cursorEmoji = getEmojiById(emojiId);
        if (cursorEmoji) {
            setCursor({
                rowIndex: categoryRowIndex + 1, // +1 because next row is the emoji row
                categoryIndex,
                categoryName,
                emojiIndex: 0, // first emoji of the category
                emoji: cursorEmoji,
            });
        }
    }, [activeCategory]);

    const resetCursor = useCallback(() => {
        setCursor({
            rowIndex: -1,
            categoryIndex: -1,
            categoryName: '',
            emojiIndex: -1,
            emoji: undefined,
        });
    }, []);

    const handleWithSearchKeyboardEmojiNavigation = (emojiIndex: EmojiCursor['emojiIndex']) => {
        const numOfSearchRows = categoryOrEmojisRows.length - 1;
        if (emojiIndex < 0 || emojiIndex > numOfSearchRows) {
            return;
        }

        const rowIndex = Math.ceil(emojiIndex / EMOJI_PER_ROW); // +1 because first row is search header

        const emojiRow = categoryOrEmojisRows.find((row) => row.index === rowIndex + 1); // +1 because first row is search header
        if (!emojiRow || emojiRow.type !== EMOJIS_ROW) {
            return;
        }

        const emojiIndexInsideRow = (emojiIndex % EMOJI_PER_ROW) + 1;

        const emoji = emojiRow.items?.[emojiIndexInsideRow] ?? null;
        if (!emoji) {
            return;
        }

        setCursor({
            rowIndex: rowIndex - 1,
            categoryIndex: 0,
            categoryName: emoji.categoryName,
            emojiIndex,
            emoji: emoji.item as Emoji,
        });
    };

    const getEmojiByCursor = (categoryIndex: EmojiCursor['categoryIndex'], emojiIndex: EmojiCursor['emojiIndex']) => {
        const categoryName = categoryNames[categoryIndex];
        console.log('categoryName', categoryName);
    };

    const handleKeyboardEmojiNavigation = useCallback((moveTo: NavigationDirection) => {
        console.log('handleKeyboardEmojiNavigation', moveTo);
        const {rowIndex, categoryIndex, categoryName, emojiIndex} = cursor;

        if (moveTo === NavigationDirection.NextEmoji) {
            if (filter.length !== 0) {
                handleWithSearchKeyboardEmojiNavigation(emojiIndex + 1);
            }
        } else if (moveTo === NavigationDirection.PreviousEmoji) {
            if (filter.length !== 0) {
                handleWithSearchKeyboardEmojiNavigation(emojiIndex - 1);
            }
        } else if (moveTo === NavigationDirection.NextEmojiRow) {
            if (filter.length !== 0) {
                handleWithSearchKeyboardEmojiNavigation(emojiIndex + EMOJI_PER_ROW);
            }
        } else if (moveTo === NavigationDirection.PreviousEmojiRow) {
            if (filter.length !== 0) {
                handleWithSearchKeyboardEmojiNavigation(emojiIndex - EMOJI_PER_ROW);
            }
        }

        // const [categoryIndex, emojiIndex] = cursor;

        // const offsetDirectionInSameCategory = direction === CURSOR_DIRECTION.NEXT ? offset : -(offset);

        // // moving to next or previous emoji in same category
        // const newCursorInSameCategory: EmojiCursor = [categoryIndex, emojiIndex + offsetDirectionInSameCategory];
        // if (getEmojiById(newCursorInSameCategory)) {
        //     setCursor(newCursorInSameCategory);
        //     return null;
        // }

        // // In next direction, if next emoji doesn't exist in same category, move to next category
        // const firstCursorInNextCategory: EmojiCursor = [categoryIndex + 1, 0]; // first emoji in next category
        // if (direction === CURSOR_DIRECTION.NEXT && getEmojiById(firstCursorInNextCategory)) {
        //     setCursor(firstCursorInNextCategory);
        //     return null;
        // }

        // // In previous direction, if previous emoji doesn't exist in same category, move to last emoji of previous category
        // if (direction === CURSOR_DIRECTION.PREVIOUS && categoryIndex !== 0) {
        //     const previousCategoryIndex = categoryIndex - 1;
        //     const numOfEmojisInPreviousCategory = categoriesOffsetsAndIndices.numOfEmojis[previousCategoryIndex];
        //     const lastCursorInPreviousCategory: EmojiCursor = [previousCategoryIndex, numOfEmojisInPreviousCategory - 1]; // last emoji in previous category
        //     if (getEmojiById(lastCursorInPreviousCategory)) {
        //         setCursor(lastCursorInPreviousCategory);
        //         return null;
        //     }
        // }

        return null;
    }, [cursor.categoryIndex, cursor.categoryName, cursor.emojiIndex, cursor.rowIndex, filter]);

    const handleEnterOnEmoji = useCallback(() => {
        const clickedEmoji = cursor.emoji;

        if (clickedEmoji) {
            onEmojiClick(clickedEmoji);
        }
    }, [cursor.categoryIndex, cursor.emojiIndex, onEmojiClick]);

    const handleEmojiOnMouseOver = useCallback((cursor: EmojiCursor) => {
        setCursor(cursor);
    }, []);

    const cursorEmojiName = useMemo(() => {
        const {emoji} = cursor;

        if (!emoji) {
            return '';
        }

        const name = emoji.short_name ? emoji.short_name : emoji.name;
        return name.replace(/_/g, ' ');
    }, [cursor.categoryIndex, cursor.emojiIndex]);

    const areSearchResultsEmpty = filter.length !== 0 && categoryOrEmojisRows.length === 1 && categoryOrEmojisRows?.[0]?.items?.[0]?.categoryName === SEARCH_RESULTS;

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
                    cursorCategoryIndex={cursor.categoryIndex}
                    cursorEmojiIndex={cursor.emojiIndex}
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
                    ref={resultsListRef}
                    isFiltering={filter.length > 0}
                    activeCategory={activeCategory}
                    categoryOrEmojisRows={categoryOrEmojisRows}
                    cursorCategoryIndex={cursor.categoryIndex}
                    cursorEmojiIndex={cursor.emojiIndex}
                    setActiveCategory={setActiveCategory}
                    onEmojiClick={onEmojiClick}
                    onEmojiMouseOver={handleEmojiOnMouseOver}
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
