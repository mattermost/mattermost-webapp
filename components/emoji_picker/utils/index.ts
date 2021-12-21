// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import isEmpty from 'lodash/isEmpty';

import {Emoji, EmojiCategory} from 'mattermost-redux/types/emojis';

import {
    Categories,
    Category,
    CategoryOrEmojiRow,
} from 'components/emoji_picker/types';

import * as EmojiUtils from 'utils/emoji.jsx';
import {getSkin} from 'utils/emoticons';
import {compareEmojis} from 'utils/emoji_utils';
import EmojiMap from 'utils/emoji_map';

import {
    EMOJI_PER_ROW,
    CATEGORY_HEADER_ROW,
    EMOJIS_ROW,
    SEARCH_RESULTS,
    CUSTOM,
    RECENT,
} from 'components/emoji_picker/constants';

function sortEmojis(
    emojis: Emoji[],
    recentEmojiStrings: string[],
    filter: string,
) {
    const recentEmojis: Emoji[] = [];
    const emojisMinusRecent: Emoji[] = [];

    Object.values(emojis).forEach((emoji) => {
        let emojiArray = emojisMinusRecent;

        const alias = emoji.short_names ? emoji.short_names : [emoji.name];
        for (let i = 0; i < alias.length; i++) {
            if (recentEmojiStrings.includes(alias[i].toLowerCase())) {
                emojiArray = recentEmojis;
            }
        }

        emojiArray.push(emoji);
    });

    return [
        ...recentEmojis.sort((firstEmoji, secondEmoji) =>
            compareEmojis(firstEmoji, secondEmoji, filter),
        ),
        ...emojisMinusRecent.sort((firstEmoji, secondEmoji) =>
            compareEmojis(firstEmoji, secondEmoji, filter),
        ),
    ];
}

function getFilteredEmojis(
    allEmojis: Record<string, Emoji>,
    filter: string,
    recentEmojisString: string[],
): Emoji[] {
    const emojis = Object.values(allEmojis).filter((emoji) => {
        const alias = emoji.short_names ? emoji.short_names : [emoji.name];

        for (let i = 0; i < alias.length; i++) {
            if (alias[i].toLowerCase().includes(filter)) {
                return true;
            }
        }

        return false;
    });

    return sortEmojis(emojis, recentEmojisString, filter);
}

function convertEmojiToUserSkinTone(
    emoji: Emoji,
    emojiSkin: string,
    userSkinTone: string,
): Emoji {
    if (emojiSkin === userSkinTone) {
        return emoji;
    }

    let newEmojiId = '';

    // If its a default (yellow) emoji, get the skin variation from its property
    if (emojiSkin === 'default') {
        newEmojiId = emoji?.skin_variations?.[userSkinTone]?.unified ?? '';
    } else if (userSkinTone === 'default') {
        newEmojiId = emoji?.unified?.replaceAll(`-${emojiSkin}`, '') ?? '';
    } else {
        newEmojiId = emoji?.unified?.replaceAll(emojiSkin, userSkinTone) ?? '';
    }

    const emojiIndex = EmojiUtils.EmojiIndicesByUnicode.get(
        newEmojiId.toLowerCase(),
    ) as number;
    return EmojiUtils.Emojis[emojiIndex];
}

export function getEmojisByCategory(
    allEmojis: Record<string, Emoji>,
    category: Category,
    categoryName: EmojiCategory,
    userSkinTone: string,
): Emoji[] {
    const emojiIds = category?.emojiIds ?? [];

    if (emojiIds.length === 0) {
        return [];
    }

    // For recent category, perform checks for skin tone uniformity
    if (categoryName === 'recent') {
        const emojiIds = category?.emojiIds ?? [];

        const recentEmojis = new Map();

        emojiIds.forEach((emojiId) => {
            const emoji = allEmojis[emojiId];
            const emojiSkin = getSkin(emoji);

            if (emojiSkin) {
                const emojiWithUserSkin = convertEmojiToUserSkinTone(
                    emoji,
                    emojiSkin,
                    userSkinTone,
                );
                recentEmojis.set(emojiWithUserSkin.unified, emojiWithUserSkin);
            } else {
                recentEmojis.set(emojiId, emoji);
            }
        });

        return Array.from(recentEmojis.values());
    }

    // For all other categories, return emojis of the categoryies from allEmojis
    return emojiIds.map((emojiId) => allEmojis[emojiId]);
}

function getEmojiFilename(emoji: Emoji) {
    return emoji.image || emoji.filename || emoji.id;
}

export function getAllEmojis(
    emojiMap: EmojiMap,
    recentEmojis: string[],
    userSkinTone: string,
    categories: Categories,
    allEmojis: Record<string, Emoji>,
): [Categories, Record<string, Emoji>] {
    const customEmojiMap = emojiMap.customEmojis;

    for (const category of Object.keys(categories)) {
        let categoryEmojis = [];
        if (category === 'recent' && recentEmojis.length) {
            const recentEmojisReversed = [...recentEmojis].reverse();
            categoryEmojis = recentEmojisReversed.
                filter((name) => {
                    return emojiMap.has(name);
                }).
                map((name) => {
                    return emojiMap.get(name);
                });
        } else {
            const indices =
                EmojiUtils.EmojiIndicesByCategory.get(userSkinTone).get(
                    category,
                ) || [];
            categoryEmojis = indices.map((index) => EmojiUtils.Emojis[index]);
            if (category === 'custom') {
                categoryEmojis = categoryEmojis.concat([
                    ...customEmojiMap.values(),
                ]);
            }
        }
        categories[category].emojiIds = categoryEmojis.map((emoji) =>
            getEmojiFilename(emoji),
        );
        for (let i = 0; i < categoryEmojis.length; i++) {
            const currentEmoji = categoryEmojis[i];
            const fileName = getEmojiFilename(currentEmoji);
            allEmojis[fileName] = {
                ...currentEmoji,
                visible: false,
                offset: null,
            };
            if (!currentEmoji.image) {
                // if custom emoji, set proper attributes
                allEmojis[fileName] = {
                    ...allEmojis[fileName],
                    aliases: currentEmoji.short_names ? currentEmoji.short_names : [currentEmoji.name],
                    category: 'custom',
                    image: fileName,
                };
            }
        }
    }

    return [categories, allEmojis];
}

export function calculateCategoryRowIndex(categories: Categories, categoryName: EmojiCategory) {
    const categoryIndex = Object.keys(categories).findIndex((category) => category === categoryName);

    const categoriesTillCurrentCategory = Object.values(categories).slice(0, categoryIndex);

    const rowIndex = categoriesTillCurrentCategory.reduce((previousIndexSum, currentCategory) => {
        const emojisInCurrentCategory = currentCategory?.emojiIds?.length ?? 0;

        const numberOfEmojiRowsInCurrentCategory = Math.ceil(emojisInCurrentCategory / EMOJI_PER_ROW);

        return previousIndexSum + numberOfEmojiRowsInCurrentCategory + 1;
    }, 0);

    return rowIndex;
}

function splitEmojisToRows(emojis: Emoji[], categoryIndex: number, categoryName: EmojiCategory, rowIndexCounter: number): [Array<CategoryOrEmojiRow<typeof EMOJIS_ROW>>, number] {
    if (emojis.length === 0) {
        return [[], rowIndexCounter - 1];
    }

    const emojiRows: Array<CategoryOrEmojiRow<typeof EMOJIS_ROW>> = [];
    let emojisIndividualRow: CategoryOrEmojiRow<typeof EMOJIS_ROW>['items'] = [];
    let emojiRowIndexCounter = rowIndexCounter;

    // create `EMOJI_PER_ROW` row lenght array of emojis
    emojis.forEach((emoji, emojiIndex) => {
        emojisIndividualRow.push({
            categoryIndex,
            categoryName,
            emojiIndex,
            emojiId: emoji.category === CUSTOM ? emoji.id as string : emoji.unified as string,
            item: emoji,
        });

        if ((emojiIndex + 1) % EMOJI_PER_ROW === 0) {
            emojiRows.push({
                index: emojiRowIndexCounter,
                type: EMOJIS_ROW,
                items: emojisIndividualRow,
            });

            emojiRowIndexCounter++;
            emojisIndividualRow = [];
        }
    });

    // if there are emojis left over that is less than `EMOJI_PER_ROW`, add them in next row
    if (emojisIndividualRow.length) {
        emojiRows.push({
            index: emojiRowIndexCounter,
            type: EMOJIS_ROW,
            items: emojisIndividualRow,
        });

        emojiRowIndexCounter++;
    }

    return [emojiRows, emojiRowIndexCounter];
}

/**
 * Creates rows of category and emoji.
 * @param allEmojis the map of all emojis
 * @param categories all categories with includes emojiIds of each category
 * @param filter search filter
 * @param recentEmojis list of recent emojis used
 * @param userSkinTone skin tone selected for emojis
 * @returns array of category name and emoji rows
 */
export function createCategoryAndEmojiRows(
    allEmojis: Record<string, Emoji>,
    categories: Categories,
    filter: string,
    userSkinTone: string,
): CategoryOrEmojiRow[] {
    if (isEmpty(allEmojis) || isEmpty(categories)) {
        return [];
    }

    // If search is active, return filtered emojis
    if (filter.length) {
        const filteredEmojis = getFilteredEmojis(allEmojis, filter, categories[RECENT]?.emojiIds ?? []);

        const searchCategoryRow: CategoryOrEmojiRow<typeof CATEGORY_HEADER_ROW> = {
            index: 0,
            type: CATEGORY_HEADER_ROW,
            items: [{
                categoryIndex: 0,
                categoryName: SEARCH_RESULTS,
                emojiIndex: -1,
                emojiId: '',
                item: categories.searchResults,
            }],
        };
        const [searchEmojisRows] = splitEmojisToRows(filteredEmojis, 0, SEARCH_RESULTS, 1);

        return [searchCategoryRow, ...searchEmojisRows];
    }

    let rowIndexCounter = 0;
    let categoryOrEmojisRows: CategoryOrEmojiRow[] = [];
    Object.keys(categories).forEach((categoryName, categoryIndex) => {
        const emojis = getEmojisByCategory(
            allEmojis,
            categories[categoryName as EmojiCategory],
            categoryName as EmojiCategory,
            userSkinTone,
        );

        // Add for the category header
        const categoryRow: CategoryOrEmojiRow<typeof CATEGORY_HEADER_ROW> = {
            index: rowIndexCounter,
            type: CATEGORY_HEADER_ROW,
            items: [{
                categoryIndex,
                categoryName: categoryName as EmojiCategory,
                emojiIndex: -1,
                emojiId: '',
                item: categories[categoryName as EmojiCategory],
            }],
        };

        categoryOrEmojisRows = [...categoryOrEmojisRows, categoryRow];
        rowIndexCounter += 1;

        const [emojiRows, increasedRowIndexCounter] = splitEmojisToRows(emojis, categoryIndex, categoryName as EmojiCategory, rowIndexCounter);

        rowIndexCounter = increasedRowIndexCounter;

        categoryOrEmojisRows = [...categoryOrEmojisRows, ...emojiRows];
    });

    return categoryOrEmojisRows;
}
