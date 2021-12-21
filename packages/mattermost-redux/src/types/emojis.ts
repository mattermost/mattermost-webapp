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
    name: string;
    category: 'custom';
    create_at: number;
    update_at: number;
    delete_at: number;
    creator_id: string;
};
export type SystemEmoji = {
    name: string;
    category: EmojiCategory;
    image: string;
    short_name: string;
    short_names: string[];
    batch: number;
    skins?: string[];
    skin_variations?: Record<string, Emoji>; // we currently don't have a use for it other than knowing the field exists.
    unified?: string;
};

export type Emoji = Partial<Omit<CustomEmoji, 'name' | 'category'>> & Partial<Omit<SystemEmoji, 'name' | 'category'>> & Pick<SystemEmoji, 'name' | 'category'> & { filename?: string };

export type EmojisState = {
    customEmoji: {
        [x: string]: CustomEmoji;
    };
    nonExistentEmoji: Set<string>;
};
