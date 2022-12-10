// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';
import {WorkTemplatesType} from 'mattermost-redux/action_types';

import {Category, WorkTemplate} from '@mattermost/types/work_templates';

function categories(state: Category[] = [], action: GenericAction): Category[] {
    switch (action.type) {
    case WorkTemplatesType.RECEIVED_WORK_TEMPLATE_CATEGORIES: {
        return [...state, ...action.data];
    }
    default:
        return state;
    }
}

function templatesInCategory(state: Record<string, WorkTemplate[]> = {}, action: GenericAction): Record<string, WorkTemplate[]> {
    switch (action.type) {
    case WorkTemplatesType.RECEIVED_WORK_TEMPLATES: {
        const nextState: Record<string, WorkTemplate[]> = {...state};
        const data = action.data as WorkTemplate[];
        const categoryIds = data.
            map((template) => template.category).
            filter((category, index, self) => self.indexOf(category) === index);

        categoryIds.forEach((category) => {
            nextState[category] = [];
            data.forEach((template) => {
                if (template.category === category) {
                    nextState[category].push(template);
                }
            });
        });
        return nextState;
    }
    default:
        return state;
    }
}

export default (combineReducers({
    categories,
    templatesInCategory,
}));

