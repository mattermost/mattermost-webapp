// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {GenericAction} from 'mattermost-redux/types/actions';
import {WorkTemplatesType} from 'mattermost-redux/action_types';
import {Category, WorkTemplate} from '@mattermost/types/work_templates';

function categories(state: Category[] = [], action: GenericAction) {
    switch (action.type) {
    case WorkTemplatesType.RECEIVED_DEV_WORK_TEMPLATES: {
        const data = action.data as WorkTemplate[];
        return data.
            map((template) => template.category).
            filter((category, index, self) => self.indexOf(category) === index);
    }
    default:
        return state;
    }
}

function templatesInCategory(state: Record<string, WorkTemplate> = {}, action: GenericAction) {
    switch (action.type) {
    case WorkTemplatesType.RECEIVED_DEV_WORK_TEMPLATES: {
        const res: Record<string, WorkTemplate[]> = {};
        const data = action.data as WorkTemplate[];
        const categoryIds = data.
            map((template) => template.category.id).
            filter((category, index, self) => self.indexOf(category) === index);

        categoryIds.forEach((category) => {
            res[category] = [];
            data.forEach((template) => {
                if (template.category.id === category) {
                    res[category].push(template);
                }
            });
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

