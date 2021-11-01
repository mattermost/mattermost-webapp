// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import EventEmitter from 'events';

import Constants from 'utils/constants';
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
        case ActionTypes.TOGGLE_SHORTCUTS_MODAL:
            this.emit(type, value, args);
            break;
        }
    }
}

const ModalStore = new ModalStoreClass();
export default ModalStore;
