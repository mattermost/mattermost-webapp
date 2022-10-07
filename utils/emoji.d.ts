// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {SystemEmoji} from '@mattermost/types/emojis';

export const Emojis: SystemEmoji[];

export const EmojiIndicesByAlias: Map<string, number>;
export const EmojiIndicesByUnicode: Map<string, number>;

export const CategoryNames: string[];
export const CategoryMessage: Map<string, string>;
export const CategoryTranslations: Map<string, string>;
export const SkinTranslations: Map<string, string>;

export const EmojiIndicesByCategory: Map<string, Map<string, number[]>>;
