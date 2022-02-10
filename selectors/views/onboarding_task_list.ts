// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {GlobalState} from 'types/store';

export function isOnBoardingTaskListOpen(state: GlobalState) {
    return state.views.onBoardingTaskList.isOpen;
}
