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

export const limitThresholds = Object.freeze({
    ok: 0,
    warn: 50,
    danger: 66,
    exceeded: 44
});
