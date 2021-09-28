// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import TimeManagementTypes from 'utils/time_management/action_types';
import {dateToWorkDateString, findAvailableSlot} from 'utils/time_management/utils';
import {WorkItem, WorkBlock} from 'types/time_management';

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
            tasks: [{
                id: '1',
                title: 'Morning systems check',
                time: 30,
                complete: true,
            }],
        },
        {
            id: '2',
            start: getTodayAtHour(10),
            tasks: [
                {
                    id: '2',
                    title: 'Drive to Mons Olympus',
                    time: 60,
                    complete: false,
                },
                {
                    id: '3',
                    title: 'Climb to the top',
                    time: 30,
                    complete: false,
                },
                {
                    id: '4',
                    title: 'Roll down',
                    time: 30,
                    complete: false,
                },
            ],
        },
        {
            id: '3',
            start: getTodayAtHour(12),
            tasks: [{
                id: '5',
                title: 'Eat a uranium isotope for lunch',
                time: 60,
                complete: false,
            }],
        },
        {
            id: '4',
            start: getTodayAtHour(14, 30),
            tasks: [{
                id: '6',
                title: 'Take some dirt samples',
                time: 120,
                complete: false,
            }],
        },
        {
            id: '5',
            start: getTodayAtHour(16, 30),
            tasks: [{
                id: '7',
                title: 'Feel lonely',
                time: 30,
                complete: false,
            }],
        },
    ],
};

const testUnscheduledWorkItems = [
    {
        id: '8',
        title: 'Charge via solar panels',
        time: 60,
        complete: false,
    },
    {
        id: '9',
        title: 'Call home base at Houston',
        time: 60,
        complete: false,
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

        const day = [...state[stringDate]] || [];
        const block = {
            id: generateId(),
            start: date,
            tasks: [task],
        };
        block.start = findAvailableSlot(block, day);
        day.push(block);

        return {...state, [stringDate]: day};
    }
    case TimeManagementTypes.RECEIVED_WORK_BLOCKS: {
        const date = action.date as Date;
        if (!date) {
            return state;
        }
        const stringDate = dateToWorkDateString(date);

        return {...state, [stringDate]: action.blocks};
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
        if (date) {
            return state;
        }
        const task = action.task as WorkItem;
        return [...state, task];
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
});
