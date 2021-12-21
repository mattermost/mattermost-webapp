// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {EmojiCategory} from 'mattermost-redux/types/emojis';

import * as Emoji from 'utils/emoji.jsx';

import {Category, Categories} from '../types';

const categoryClass: Map<EmojiCategory, string> = new Map([
    ['recent', 'icon-clock-outline'],
    ['searchResults', ''],
    ['smileys-emotion', 'icon-emoticon-happy-outline'],
    ['people-body', 'icon-account-outline'],
    ['animals-nature', 'icon-leaf-outline'],
    ['food-drink', 'icon-food-apple'],
    ['activities', 'icon-basketball'],
    ['travel-places', 'icon-airplane-variant'],
    ['objects', 'icon-lightbulb-outline'],
    ['symbols', 'icon-heart-outline'],
    ['flags', 'icon-flag-outline'],
    ['custom', 'icon-emoticon-custom-outline'],
]);

function createCategory(name: EmojiCategory): Category {
    return {
        name,
        id: Emoji.CategoryTranslations.get(name),
        className: categoryClass.get(name) || '',
        message: Emoji.CategoryMessage.get(name),
        offset: 0,
    };
}

export const RECENT_EMOJI_CATEGORY: Pick<Categories, 'recent'> = {recent: createCategory('recent')};
export const SEARCH_RESULTS = 'searchResults';
export const SEARCH_EMOJI_CATEGORY: Pick<Categories, typeof SEARCH_RESULTS> = {searchResults: createCategory(SEARCH_RESULTS)};

export const CATEGORIES: Categories = Emoji.CategoryNames.
    filter((category) => !(category === 'recent' || category === 'searchResults')).
    reduce((previousCategory, currentCategory) => {
        return {
            ...previousCategory,
            [currentCategory]: createCategory(currentCategory as EmojiCategory),
        };
    }, {} as Categories);

export const EMOJI_PER_ROW = 9; // needs to match variable `$emoji-per-row` in _variables.scss
