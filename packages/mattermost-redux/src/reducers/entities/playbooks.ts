// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';
import {PlaybookType} from 'mattermost-redux/action_types';

function templates(state: [] = [], action: GenericAction) {
    switch (action.type) {
    case PlaybookType.PLAYBOOKS_PUBLISH_TEMPLATES:
        return action.templates;
    default:
        return state;
    }
}

export default (combineReducers({
    templates,
}));

