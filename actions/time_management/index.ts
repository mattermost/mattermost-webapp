// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ActionFunc, DispatchFunc, GetStateFunc, GenericAction} from 'mattermost-redux/types/actions';

import TimeManagementTypes from 'utils/time_management/action_types';
import {findBlockWithMatchingTagAndAddTask} from 'utils/time_management/utils';
import {WorkBlock, WorkItem} from 'types/time_management';
import {generateId} from 'utils/utils';

export function createNewTask(text: string, minutes: number, date?: Date | null, tag?: string, dateIsTimeSpecific?: boolean): ActionFunc {
    return (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const task: WorkItem = {
            id: generateId(),
            title: text,
            time: minutes,
            complete: false,
        };

        let block: WorkBlock | null | undefined;

        // TODO what to do if tag and date are both set
        if (tag && date && !dateIsTimeSpecific) {
            task.tags = [{title: tag, color: ''}];
            const state = getState();
            block = findBlockWithMatchingTagAndAddTask(state.time.workBlocksByDay, state.time.reoccurringBlocks, task);
        }

        if (block) {
            dispatch({
                type: TimeManagementTypes.RECEIVED_WORK_BLOCK,
                block,
            });
        } else {
            dispatch({
                type: TimeManagementTypes.RECEIVED_WORK_ITEM,
                task,
                date,
                dateIsTimeSpecific,
            });
        }

        return {data: task};
    };
}

export function createBlockFromTask(task: WorkItem, date: Date, sourceId?: string): GenericAction {
    return {
        type: TimeManagementTypes.RECEIVED_WORK_ITEM,
        task,
        date,
        sourceId,
        dateIsTimeSpecific: true,
    };
}

export function updateWorkBlocks(blocks: WorkBlock[], date: Date): GenericAction {
    return {
        type: TimeManagementTypes.RECEIVED_WORK_BLOCKS,
        blocks,
        date,
    };
}
