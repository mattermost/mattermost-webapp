// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {FormatNumberOptions} from 'react-intl';

import {FileSizes} from './file_utils';

export function asGBString(bits: number, formatNumber: (b: number, options: FormatNumberOptions) => string): string {
    return `${formatNumber(bits / FileSizes.Gigabyte, {maximumFractionDigits: 0})}GB`;
}

export function inK(num: number): string {
    return `${Math.floor(num / 1000)}K`;
}

// usage percent meaning 0-100 (for use in usage bar)
export function toUsagePercent(usage: number, limit: number): number {
    return Math.floor((usage / limit) * 100);
}

// These are to be used when we need values
// even if network requests are failing for some reason.
// Use as a fallback.
export const fallbackStarterLimits = {
    messages: {
        history: 10000,
    },
    files: {
        totalStorage: FileSizes.Gigabyte * 10,
    },
    integrations: {
        enabled: 10,
    },
    boards: {
        cards: 500,
    },
};
