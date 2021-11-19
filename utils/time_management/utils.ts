// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import moment from 'moment';

import {WorkItem, WorkBlock, ReoccurringBlock} from 'types/time_management';

import {Dictionary} from 'mattermost-redux/types/utilities';

export function dateToWorkDateString(date: Date): string {
    return `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;
}

export function isBlockStartTimeEqual(a: WorkBlock, b: WorkBlock) {
    return a.start.getTime() === b.start.getTime();
}

export function calculateMinutesInBlockFromTasks(block: WorkBlock): number {
    return block.tasks.reduce((a, b) => a + b.time, 0);
}

export function calculateMinutesInBlock(block: WorkBlock): number {
    return Math.max(calculateMinutesInBlockFromTasks(block), block.min_time || 0);
}

function calculateBlockEndTime(block: WorkBlock): moment.Moment {
    const minutesInBlock = calculateMinutesInBlock(block);
    return moment(block.start).add(minutesInBlock, 'minutes');
}

export function findBlockWithMatchingTagAndAddTask(blocksByDay: Dictionary<WorkBlock[]>, reoccurringBlocks: ReoccurringBlock[], task: WorkItem): WorkBlock | null | undefined {
    if (task.tags == null || task.tags.length === 0) {
        return null;
    }

    // TODO check more than just first tag
    const tag = task.tags[0];
    if (tag == null) {
        return null;
    }

    const allBlocks: WorkBlock[] = [];
    const days = Object.values(blocksByDay);
    days.forEach((blocks) => allBlocks.push(...blocks));

    // First check if there is an existing block we can schedule this task in.
    const matchingBlockWithSpace = allBlocks.find((b) => {
        if (!b.tags || !b.min_time) {
            return false;
        }
        if (b.tags.findIndex((t) => t.title === tag.title) === -1) {
            return false;
        }
        const currentMinutes = calculateMinutesInBlockFromTasks(b);
        if (currentMinutes + task.time > b.min_time) {
            return false;
        }
        return true;
    });

    if (matchingBlockWithSpace) {
        const newBlock = {...matchingBlockWithSpace};
        newBlock.tasks = [...newBlock.tasks, task];
        return newBlock;
    }

    // If no existing "real" blocks have space or matching tags for our task
    // we need to check if any reoccurring blocks match.
    const matchingReoccurringBlock = reoccurringBlocks.find((r) => {
        if (!r.tags || !r.min_time) {
            return false;
        }
        if (r.tags.findIndex((t) => t.title === tag.title) === -1) {
            return false;
        }
        if (task.time > r.min_time) {
            return false;
        }
        return true;
    });

    if (!matchingReoccurringBlock) {
        return null;
    }

    // Now that we have a matching reocurring block we need to find the last coressponding
    // "real" block so we can create the next instance of the reoccurring block.
    let newestInstanceOfReoccurringBlock: WorkBlock | undefined;
    allBlocks.forEach((b) => {
        if (b.reoccurring_id !== matchingReoccurringBlock.id) {
            return;
        }
        if (!newestInstanceOfReoccurringBlock) {
            newestInstanceOfReoccurringBlock = b;
            return;
        }

        if (newestInstanceOfReoccurringBlock.start.getTime() < b.start.getTime()) {
            newestInstanceOfReoccurringBlock = b;
        }
    });

    let start: Date = new Date();
    let newestInstanceStart;

    // Create the next reoccurring block based on the frequency.
    if (newestInstanceOfReoccurringBlock) {
        newestInstanceStart = moment(newestInstanceOfReoccurringBlock.start);
    } else {
        start.setHours(matchingReoccurringBlock.start.getHours(), matchingReoccurringBlock.start.getMinutes(), 0, 0);

        const now = new Date();
        if (start.getTime() < now.getTime()) {
            newestInstanceStart = moment(start);
        }
    }

    if (newestInstanceStart) {
        switch (matchingReoccurringBlock.frequency) {
        case 'daily':
            start = newestInstanceStart.add(1, 'day').toDate();
            break;
        case 'weekly':
            start = newestInstanceStart.add(1, 'week').toDate();
            break;
        default:
            return null;
        }
    }

    return {
        id: '',
        tasks: [task],
        start,
        min_time: matchingReoccurringBlock.min_time,
        tags: matchingReoccurringBlock.tags,
        reoccurring_id: matchingReoccurringBlock.id,
    };
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
    const dayStart = new Date(block.start);
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
