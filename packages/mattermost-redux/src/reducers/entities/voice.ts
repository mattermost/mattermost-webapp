// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {VoiceTypes} from '../../action_types';

import {GenericAction} from '../../types/actions';

const defaultState = {
    recordingModalVisible: false,
};

function recordingModalVisible(state = defaultState.recordingModalVisible, action: GenericAction) {
    switch (action.type) {
    case VoiceTypes.OPEN_RECORDING_MODAL:
        return true;
    case VoiceTypes.CLOSE_RECORDING_MODAL:
        return false;
    default:
        return state;
    }
}

export default combineReducers({
    recordingModalVisible,
});
