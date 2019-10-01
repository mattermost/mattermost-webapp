export type SystemEmojiCategory = (
    | 'people'
    | 'nature'
    | 'foods'
    | 'activity'
    | 'places'
    | 'objects'
    | 'symbols'
    | 'flags'
    | 'custom'
);

export interface SystemEmoji {
    aliases: string[];
    batch: string;
    category: SystemEmojiCategory;
    filename: string;
    offset: null;
    visible: boolean;
}

export interface CustomEmoji {
    id: string;
    aliases: string[];
    category: 'custom';
    filename: string;
    name: string;
    offset: null;
    visible: boolean;
}

export type Emoji = SystemEmoji | CustomEmoji;

export function isSystemEmoji(emoji: Emoji): emoji is SystemEmoji {
    return 'batch' in emoji;
}

export function isCustomEmoji(emoji: Emoji): emoji is CustomEmoji {
    return 'name' in emoji;
}
