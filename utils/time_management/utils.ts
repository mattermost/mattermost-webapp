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

function calculateBlockEndTime(block: WorkBlock): moment.Moment {
    const minutesInBlock = calculateMinutesInBlock(block);
    return moment(block.start).add(minutesInBlock, 'minutes');
}

export function addBlockAndResolveTimeOverlaps(blocks: WorkBlock[], newBlock: WorkBlock): string[] {
    const blockIDsToMove = [];

    const newBlockStartTime = moment(newBlock.start);
    const newBlockEndTime = calculateBlockEndTime(newBlock);

    for (let i = 0; i < blocks.length; i++) {
        const currentBlock = blocks[i];
        const currentBlockStartTime = moment(currentBlock.start);
        const currentBlockEndTime = calculateBlockEndTime(currentBlock);

        if (newBlockStartTime.isBetween(currentBlockStartTime, currentBlockEndTime, 'minute', '[]')) {
            blockIDsToMove.push(currentBlock.id);
            continue;
        }

        if (currentBlockStartTime.isBetween(newBlockStartTime, newBlockEndTime, 'minute', '[]')) {
            blockIDsToMove.push(currentBlock.id);
        }
    }

    blocks.push(newBlock);
    const blockIDsNotMoved: string[] = [];
    blockIDsToMove.forEach((id) => {
        const moved = moveBlockToNewSlot(id, blocks);
        if (!moved) {
            blockIDsNotMoved.push(id);
        }
    });

    return blockIDsNotMoved;
}

function moveBlockToNewSlot(blockId: string, blocks: WorkBlock[]): boolean {
    const index = blocks.findIndex((b) => b.id === blockId);
    const block = blocks[index];
    blocks.splice(index, 1);
    const newStart = findAvailableSlot(block, blocks);
    if (newStart == null) {
        return false;
    }
    const newBlockAtSameTime = {...block, start: newStart};
    blocks.push(newBlockAtSameTime);
    return true;
}

const dayStartHour = 9;

export function findAvailableSlot(block: WorkBlock, blocks: WorkBlock[]): Date | null {
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

    return null;
}

export function findAndRemoveTaskFromBlock(blocks: WorkBlock[], taskId: string, blockId: string) {
    const sourceIndex = blocks.findIndex((b) => b.id === blockId);
    const newSourceBlock = {...blocks[sourceIndex]};
    newSourceBlock.tasks = [...newSourceBlock.tasks];

    const taskIndex = newSourceBlock.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex >= 0) {
        newSourceBlock.tasks.splice(taskIndex, 1);
    }

    if (newSourceBlock.tasks.length === 0) {
        blocks.splice(sourceIndex, 1);
    } else {
        blocks.splice(sourceIndex, 1, newSourceBlock);
    }
}
