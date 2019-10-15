// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {ActionTypes} from 'utils/constants.jsx';

export default function settings(state = {}, action) {
    switch (action.type) {
    case ActionTypes.UPDATE_ACTIVE_SECTION:
        return {
            activeSection: action.data,
            previousActiveSection: typeof state.activeSection === 'undefined' ? action.data : state.activeSection,
        };
    case ActionTypes.SETUP_PREVIOUS_ACTIVE_SECTION:
        return {
            previousActiveSection: action.data,
        };
    default:
        return state;
    }
}