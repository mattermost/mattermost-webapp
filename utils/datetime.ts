// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import moment from 'moment-timezone';
import {Unit} from '@formatjs/intl-relativetimeformat';

const shouldTruncate = new Map<Unit, boolean>([
    ['year', true],
    ['quarter', true],
    ['month', true],
    ['week', true],
    ['day', true],
    ['hour', false],
    ['minute', false],
    ['second', true],
]);

export function isWithin(
    a: Date,
    b: Date,
    timeZone: string = new Intl.DateTimeFormat().resolvedOptions().timeZone,
    unit: Unit,
    threshold = 1,
    truncateEndpoints = shouldTruncate.get(unit) || false,
): boolean {
    const diff = getDiff(a, b, timeZone, unit, truncateEndpoints);
    return threshold >= 0 ?
        diff <= threshold && diff >= 0 :
        diff >= threshold && diff <= 0;
}

export function isEqual(
    a: Date,
    b: Date,
    timeZone: string = new Intl.DateTimeFormat().resolvedOptions().timeZone,
    unit: Unit,
    threshold = 1,
    truncateEndpoints = shouldTruncate.get(unit) || false,
): boolean {
    return threshold === getDiff(a, b, timeZone, unit, truncateEndpoints);
}

export function getDiff(
    a: Date,
    b: Date,
    timeZone: string = new Intl.DateTimeFormat().resolvedOptions().timeZone,
    unit: Unit,
    truncateEndpoints = shouldTruncate.get(unit) || false,
): number {
    const momentA = moment.utc(a.getTime());
    const momentB = moment.utc(b.getTime());

    if (timeZone) {
        momentA.tz(timeZone);
        momentB.tz(timeZone);
    }

    return truncateEndpoints ?
        momentA.startOf(unit).diff(momentB.startOf(unit), unit) :
        momentA.diff(b, unit, true);
}

export function isSameDay(a: Date, b: Date = new Date()) {
    return a.getDate() === b.getDate() && isSameMonth(a, b);
}

export function isSameMonth(a: Date, b: Date = new Date()) {
    return a.getMonth() === b.getMonth() && isSameYear(a, b);
}

export function isSameYear(a: Date, b: Date = new Date()) {
    return a.getFullYear() === b.getFullYear();
}

export function isToday(date: Date) {
    return isSameDay(date);
}

export function isYesterday(date: Date) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return isSameDay(date, yesterday);
}
