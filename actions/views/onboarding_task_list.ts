// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {ActionTypes} from 'utils/constants';

export function setOnBoardingTaskList(open: boolean) {
    return {
        type: ActionTypes.ON_BOARDING_TASK_LIST_TOGGLE,
        open,
    };
}
