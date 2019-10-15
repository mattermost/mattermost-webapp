// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ActionTypes} from 'utils/constants.jsx';

export function updateActiveSection(newActiveSection) {
    return {
        type: ActionTypes.UPDATE_ACTIVE_SECTION,
        data: newActiveSection,
    };
}

export function setupPreviousActiveSection(previousActiveSection) {
    return {
        type: ActionTypes.SETUP_PREVIOUS_ACTIVE_SECTION,
        data: previousActiveSection,
    };
}