// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';
import {WorkTemplatesType} from 'mattermost-redux/action_types';

import {Category, WorkTemplate} from '@mattermost/types/worktemplates';

function categories(state: Category[] = [], action: GenericAction): Category[] {
    switch (action.type) {
    case WorkTemplatesType.RECEIVED_WORK_TEMPLATE_CATEGORIES: {
        const nextState = [...state];
        for (const category of action.data) {
            nextState.push(category);
        }
        return nextState;
    }
    default:
        return state;
    }
}

function templatesInCategory(state: Record<string, WorkTemplate[]> = {}, action: GenericAction): Record<string, WorkTemplate[]> {
    switch (action.type) {
    case WorkTemplatesType.RECEIVED_WORK_TEMPLATES: {
        const res: Record<string, WorkTemplate[]> = {};
        const data = action.data as WorkTemplate[];
        data.forEach((template) => {
            const category = template.category;
            if (!res[category]) {
                res[category] = [];
            }
            res[category].push(template);
        });
        return res;
    }
    default:
        return state;
    }
}

export default (combineReducers({
    categories,
    templatesInCategory,
}));

