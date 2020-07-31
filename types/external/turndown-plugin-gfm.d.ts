// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

declare module 'turndown-plugin-gfm' {
    export function strikethrough(service: TurndownService): void;
    export function taskListItems(service: TurndownService): void;
}
