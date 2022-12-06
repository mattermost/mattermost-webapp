// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {WorkTemplatesType} from 'mattermost-redux/action_types';
import {ActionFunc} from 'mattermost-redux/types/actions';
import {bindClientFunc} from 'mattermost-redux/actions/helpers';
import {Client4} from 'mattermost-redux/client';

export function getWorkTemplateCategories(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getWorkTemplateCategoriesRoute,
        onRequest: WorkTemplatesType.WORK_TEMPLATE_CATEGORIES_REQUEST,
        onSuccess: [WorkTemplatesType.RECEIVED_WORK_TEMPLATE_CATEGORIES],
    });
}

export function getWorkTemplates(categoryId: string): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getWorkTemplatesRoute,
        onRequest: WorkTemplatesType.WORK_TEMPLATES_REQUEST,
        onSuccess: [WorkTemplatesType.RECEIVED_WORK_TEMPLATES],
        params: [categoryId],
    });
}
