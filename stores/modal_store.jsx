// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import EventEmitter from 'events';

import Constants from 'utils/constants.jsx';
import AppDispatcher from '../dispatcher/app_dispatcher.jsx';

const ActionTypes = Constants.ActionTypes;

class ModalStoreClass extends EventEmitter {
    constructor() {
        super();

        this.dispatchToken = AppDispatcher.register(this.handleEventPayload);
    }

    addModalListener = (action, callback) => {
        this.on(action, callback);
    }

    removeModalListener = (action, callback) => {
        this.removeListener(action, callback);
    }

    handleEventPayload = (payload) => {
        // toggle event handlers should accept a boolean show/hide value and can accept a map of arguments
        const {type, value, ...args} = payload.action; //eslint-disable-line no-use-before-define

        switch (type) {
        case ActionTypes.TOGGLE_ACCOUNT_SETTINGS_MODAL:
        case ActionTypes.TOGGLE_SHORTCUTS_MODAL:
        case ActionTypes.TOGGLE_IMPORT_THEME_MODAL:
        case ActionTypes.TOGGLE_INVITE_MEMBER_MODAL:
        case ActionTypes.TOGGLE_DELETE_POST_MODAL:
        case ActionTypes.TOGGLE_GET_POST_LINK_MODAL:
        case ActionTypes.TOGGLE_GET_TEAM_INVITE_LINK_MODAL:
        case ActionTypes.TOGGLE_GET_PUBLIC_LINK_MODAL:
        case ActionTypes.TOGGLE_QUICK_SWITCH_MODAL:
        case ActionTypes.TOGGLE_CHANNEL_HEADER_UPDATE_MODAL:
        case ActionTypes.TOGGLE_CHANNEL_PURPOSE_UPDATE_MODAL:
        case ActionTypes.TOGGLE_CHANNEL_NAME_UPDATE_MODAL:
        case ActionTypes.TOGGLE_LEAVE_PRIVATE_CHANNEL_MODAL:
            this.emit(type, value, args);
            break;
        }
    }
}

const ModalStore = new ModalStoreClass();
export default ModalStore;
