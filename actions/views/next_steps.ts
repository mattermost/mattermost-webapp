// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ActionTypes} from 'utils/constants';

export function setShowNextStepsView(show: boolean) {
    return {
        type: ActionTypes.SET_SHOW_NEXT_STEPS_VIEW,
        show,
    };
}
