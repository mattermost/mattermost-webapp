// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import moment from 'moment';

import {WorkBlock} from 'types/time_management';

export function dateToWorkDateString(date: Date): string {
    return `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
}

export function isBlockStartTimeEqual(a: WorkBlock, b: WorkBlock) {
    return a.start.getTime() === b.start.getTime();
}

export function calculateMinutesInBlock(block: WorkBlock): number {
    return block.tasks.reduce((a, b) => a + b.time, 0);
}

const dayStartHour = 9;

export function findAvailableSlot(block: WorkBlock, blocks: WorkBlock[]): Date {
    const dayStart = new Date();
    dayStart.setHours(dayStartHour, 0, 0, 0);

    if (blocks.length === 0) {
        return dayStart;
    }

    const sortedBlocksByStart = [...blocks].sort((a: WorkBlock, b: WorkBlock) => {
        return a.start - b.start;
    });

    const minutesRequired = calculateMinutesInBlock(block);

    // Check if there's an open slot between day start and the first block.
    const firstBlockStart = moment(sortedBlocksByStart[0].start);
    const minutesBetweenDayStartAndFirstBlock = moment.duration(firstBlockStart.diff(moment(dayStart))).asMinutes();
    if (minutesBetweenDayStartAndFirstBlock >= minutesRequired) {
        return dayStart;
    }

    // Find an open slot between other work blocks.
    for (let i = 0; i < sortedBlocksByStart.length; i++) {
        const currentBlock = sortedBlocksByStart[i];
        const minutesInCurrentBlock = calculateMinutesInBlock(currentBlock);
        const currentBlockEndTime = moment(currentBlock.start).add(minutesInCurrentBlock, 'minutes');

        if (i >= sortedBlocksByStart.length - 1) {
            return currentBlockEndTime.toDate();
        }

        const nextBlock = sortedBlocksByStart[i + 1];
        const nextBlockStart = moment(nextBlock.start);

        const minutesBetweenCurrentAndNext = moment.duration(nextBlockStart.diff(currentBlockEndTime)).asMinutes();

        if (minutesBetweenCurrentAndNext >= minutesRequired) {
            return currentBlockEndTime.toDate();
        }
    }

    return dayStart;
}
