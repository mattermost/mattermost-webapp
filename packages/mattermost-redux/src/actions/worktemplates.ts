// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {WorkTemplate} from '@mattermost/types/worktemplates';
import {WorkTemplatesType} from 'mattermost-redux/action_types';

export function injectDevData(worktemplates: WorkTemplate[]) {
    return {
        type: WorkTemplatesType.RECEIVED_DEV_WORKTEMPLATES,
        data: worktemplates,
    };
}
