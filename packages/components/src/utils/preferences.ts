// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export function getPreferenceKey(category: string, name: string): string {
    return `${category}--${name}`;
}
