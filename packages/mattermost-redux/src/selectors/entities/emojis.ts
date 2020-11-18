// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';

import {getConfig} from '../../selectors/entities/general';

import {CustomEmoji} from '../../types/emojis';
import {GlobalState} from '../../types/store';
import {IDMappedObjects} from '../../types/utilities';

import {createIdsSelector} from '../../utils/helpers';

export const getCustomEmojis: (state: GlobalState) => IDMappedObjects<CustomEmoji> = createSelector(
    getConfig,
    (state) => state.entities.emojis.customEmoji,
    (config, customEmoji) => {
        if (config.EnableCustomEmoji !== 'true') {
            return {};
        }

        return customEmoji;
    },
);

export const getCustomEmojisAsMap: (state: GlobalState) => Map<string, CustomEmoji> = createSelector(
    getCustomEmojis,
    (emojis) => {
        const map = new Map();
        Object.keys(emojis).forEach((key: string) => {
            map.set(key, emojis[key]);
        });
        return map;
    },
);

export const getCustomEmojisByName: (state: GlobalState) => Map<string, CustomEmoji> = createSelector(
    getCustomEmojis,
    (emojis: IDMappedObjects<CustomEmoji>): Map<string, CustomEmoji> => {
        const map: Map<string, CustomEmoji> = new Map();

        Object.keys(emojis).forEach((key: string) => {
            map.set(emojis[key].name, emojis[key]);
        });

        return map;
    },
);

export const getCustomEmojiIdsSortedByName: (state: GlobalState) => Array<string> = createIdsSelector(
    getCustomEmojis,
    (emojis: IDMappedObjects<CustomEmoji>): Array<string> => {
        return Object.keys(emojis).sort(
            (a: string, b: string): number => emojis[a].name.localeCompare(emojis[b].name),
        );
    },
);
