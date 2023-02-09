// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export enum CardSizes {
    large = 'lg',
    medium = 'md',
    small = 'sm',
}

export type ItemProp = {
    total: number;
    label: string;
}

export type ItemProps = {
    title: string;
    subtitle?: string;
    items: ItemProp[];
}
