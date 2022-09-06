// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ServerError} from '@mattermost/types/errors';
import {Team} from '@mattermost/types/teams';

import {ActionFunc} from 'mattermost-redux/types/actions';

export function fetchChannelsMembersCategories(teamId: Team['id']): ActionFunc<boolean, ServerError> {
    return async (dispatch, getState) => {
        
    };
}
