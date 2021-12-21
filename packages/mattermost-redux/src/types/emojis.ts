// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type EmojiCategory =
    | 'recent'
    | 'searchResults'
    | 'smileys-emotion'
    | 'people-body'
    | 'animals-nature'
    | 'food-drink'
    | 'activities'
    | 'travel-places'
    | 'objects'
    | 'symbols'
    | 'flags'
    | 'custom';

export type CustomEmoji = {
    id: string;
    create_at: number;
    update_at: number;
    delete_at: number;
    creator_id: string;
    name: string;
    category: 'custom';
};
export type SystemEmoji = {
    name: string;
    image: string;
    short_name: string;
    short_names: string[];
    category: EmojiCategory;
    batch: number;
    skins?: string[];
    skin_variations?: unknown[]; // we currently don't have a use for it other than knowing the field exists.
};
export type Emoji = SystemEmoji | CustomEmoji;
export type EmojisState = {
    customEmoji: {
        [x: string]: CustomEmoji;
    };
    nonExistentEmoji: Set<string>;
};
