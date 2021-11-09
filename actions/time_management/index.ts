// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {GenericAction} from 'mattermost-redux/types/actions';

import TimeManagementTypes from 'utils/time_management/action_types';

import {WorkBlock, WorkItem} from 'types/time_management';
import {generateId} from 'utils/utils';

export function createNewTask(text: string, minutes: number, date: Date, tag: string | undefined): GenericAction {
    return {
        type: TimeManagementTypes.RECEIVED_WORK_ITEM,
        task: {
            id: generateId(),
            title: text,
            time: minutes,
            tag,
        },
        date,
    };
}

export function createBlockFromTask(task: WorkItem, date: Date, sourceId?: string): GenericAction {
    return {
        type: TimeManagementTypes.RECEIVED_WORK_ITEM,
        task,
        date,
        sourceId,
    };
}

export function updateWorkBlocks(blocks: WorkBlock[], date: Date): GenericAction {
    return {
        type: TimeManagementTypes.RECEIVED_WORK_BLOCKS,
        blocks,
        date,
    };
}
