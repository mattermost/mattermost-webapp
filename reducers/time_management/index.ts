// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import TimeManagementTypes from 'utils/time_management/action_types';
import {addBlockAndResolveTimeOverlaps, dateToWorkDateString, findAndRemoveTaskFromBlock} from 'utils/time_management/utils';
import {WorkItem, WorkBlock, ReoccurringBlock} from 'types/time_management';

import {generateId} from 'utils/utils';

import {UserTypes} from 'mattermost-redux/action_types';
import {GenericAction} from 'mattermost-redux/types/actions';
import {Dictionary} from 'mattermost-redux/types/utilities';

const today = new Date();
const getTodayAtHour = (hour: number, min = 0) => {
    const newDate = new Date(today);
    newDate.setHours(hour, min, 0, 0);
    return newDate;
};

const testWorkItemsByDay = {
    [dateToWorkDateString(new Date())]: [
        {
            id: '1',
            start: getTodayAtHour(9),
            tags: [{title: 'morning', color: 'lightgrey'}, {title: 'messages', color: '#D24B4E'}],
            tasks: [{
                id: '1',
                title: 'Check MM messages',
                time: 15,
                complete: false,
            },
            {
                id: '1.1',
                title: 'Check email',
                time: 15,
                complete: false,
            },
            {
                id: '1.2',
                title: 'Review schedule for the day',
                time: 15,
                complete: false,
            }],
        },
        {
            id: '1.1',
            start: getTodayAtHour(9, 45),
            tags: [{title: 'break', color: '#CC8F00'}],
            tasks: [{
                id: '1.3',
                title: 'Eat breakfast',
                time: 30,
                complete: false,
            }],
        },
        {
            id: '2',
            start: getTodayAtHour(10, 15),
            tags: [{title: 'pr-reviews', color: '#3DB887'}],
            tasks: [
                {
                    id: '2',
                    title: 'Review [mattermost/mattermost-webapp#213](https://github.com/mattermost/desktop/pull/1857)',
                    time: 15,
                    complete: false,
                },
                {
                    id: '3',
                    title: 'Review [mattermost/mattermost-server#4555](https://github.com/mattermost/desktop/pull/1857)',
                    time: 15,
                    complete: false,
                },
                {
                    id: '4',
                    title: 'Review [mattermost/mattermost-desktop#21](https://github.com/mattermost/desktop/pull/1857)',
                    time: 15,
                    complete: false,
                },
            ],
        },
        {
            id: '2.1',
            start: getTodayAtHour(11, 0),
            tags: [{title: 'break', color: '#CC8F00'}],
            tasks: [{
                id: '6.2',
                title: 'Take a break',
                time: 20,
                complete: false,
            }],
        },
        {
            id: '2.2',
            start: getTodayAtHour(11, 20),
            tags: [{title: 'sprint-work', color: '#1592E0'}],
            tasks: [{
                id: '6.1',
                title: 'Work on card [MM-321]()',
                time: 40,
                complete: false,
            }],
        },
        {
            id: '3',
            start: getTodayAtHour(12),
            tags: [{title: 'break', color: '#CC8F00'}],
            tasks: [{
                id: '5',
                title: 'Eat lunch',
                time: 60,
                complete: false,
            }],
        },
        {
            id: '5',
            start: getTodayAtHour(16, 30),
            tasks: [{
                id: '7',
                title: 'Write and post status update for the day',
                time: 30,
                complete: false,
            }],
        },
    ],
};

const testUnscheduledWorkItems = [
    {
        id: '8',
        title: 'Write blog post for XYZ',
        time: 90,
        complete: false,
    },
    {
        id: '9',
        title: 'Prepare for R&D demo',
        time: 30,
        complete: false,
    },
];

const testReoccurringBlocks = [
    {
        id: '1',
        start: getTodayAtHour(14, 30),
        tags: [{title: 'sprint-work', color: '#1592E0'}],
        min_time: 120,
        frequency: 'daily',
    },
];

export function workBlocksByDay(state: Dictionary<WorkBlock[]> = testWorkItemsByDay, action: GenericAction) {
    switch (action.type) {
    case TimeManagementTypes.RECEIVED_WORK_ITEM: {
        const date = action.date as Date;
        if (!date) {
            return state;
        }
        const stringDate = dateToWorkDateString(date);
        const task = action.task as WorkItem;

        const blocks = state[stringDate];
        const newBlocks = blocks ? [...blocks] : [];
        const block = {
            id: generateId(),
            start: date,
            tasks: [task],
        };

        addBlockAndResolveTimeOverlaps(newBlocks, block);

        if (action.sourceId) {
            findAndRemoveTaskFromBlock(newBlocks, task.id, action.sourceId);
        }

        return {...state, [stringDate]: newBlocks};
    }
    case TimeManagementTypes.RECEIVED_WORK_BLOCKS: {
        const date = action.date as Date;
        if (!date) {
            return state;
        }
        const stringDate = dateToWorkDateString(date);

        return {...state, [stringDate]: action.blocks};
    }
    case TimeManagementTypes.RECEIVED_WORK_BLOCK: {
        const block = action.block as WorkBlock;
        const stringDate = dateToWorkDateString(block.start);

        // If the block doesn't have an id then it's new
        if (!block.id) {
            block.id = generateId();
            const blocks = state[stringDate];
            const newBlocks = blocks ? [...blocks] : [];
            return {...state, [stringDate]: [...newBlocks, block]};
        }

        // If the block has an id it already exists and we need to find and update it
        const newBlocks = [...state[stringDate]];
        const oldBlockIndex = newBlocks.findIndex((b) => b.id === block.id);
        if (oldBlockIndex === -1) {
            // Should never happen
            return state;
        }
        newBlocks.splice(oldBlockIndex, 1, block);
        return {...state, [stringDate]: newBlocks};
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

export function reoccurringBlocks(state: ReoccurringBlock[] = testReoccurringBlocks, action: GenericAction) {
    switch (action.type) {
    case TimeManagementTypes.RECEIVED_REOCCURRING_BLOCK: {
        const block = action.block as ReoccurringBlock;
        return [...state, block];
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

export function unscheduledWorkItems(state: WorkItem[] = testUnscheduledWorkItems, action: GenericAction) {
    switch (action.type) {
    case TimeManagementTypes.RECEIVED_WORK_ITEM: {
        const date = action.date;
        const task = action.task as WorkItem;

        if (date) {
            const index = state.findIndex((t) => t.id === task.id);
            if (index === -1) {
                return state;
            }
            const nextState = [...state];
            nextState.splice(index, 1);
            return nextState;
        }

        return [...state, task];
    }
    case TimeManagementTypes.RECEIVED_WORK_BLOCKS: {
        const taskIds: string[] = [];
        action.blocks.forEach((block: WorkBlock) => taskIds.push(...block.tasks.map((t) => t.id)));

        const nextState = [...state];
        let i = state.length;
        let removed = false;
        while (i--) {
            if (taskIds.includes(state[i].id)) {
                removed = true;
                nextState.splice(i, 1);
            }
        }

        if (removed) {
            return nextState;
        }
        return state;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

export default combineReducers({
    workBlocksByDay,
    unscheduledWorkItems,
    reoccurringBlocks,
});
