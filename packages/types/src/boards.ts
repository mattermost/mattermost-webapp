// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
export declare type BoardsUsageResponse = {

    // i.e. limit on cards usage
    cards: number;

    // i.e. limit on views
    views: number;
    used_cards: number;
    card_limit_timestamp: number;
};

