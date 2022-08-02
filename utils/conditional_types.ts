// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * Based on https://stackoverflow.com/a/49725198
 */
export type RequireOnlyOne<T, Keys extends keyof T = keyof T> =
Pick<T, Exclude<keyof T, Keys>> & {[K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>>}[Keys];

/**
 * Based on https://stackoverflow.com/a/49725198
 */
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
    Pick<T, Exclude<keyof T, Keys>> & {[K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>}[Keys]
