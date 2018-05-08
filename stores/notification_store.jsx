// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import EventEmitter from 'events';

import Constants from 'utils/constants.jsx';
import AppDispatcher from '../dispatcher/app_dispatcher.jsx';

const ActionTypes = Constants.ActionTypes;

const CHANGE_EVENT = 'change';

class NotificationStoreClass extends EventEmitter {
    emitChange() {
        this.emit(CHANGE_EVENT);
    }

    addChangeListener(callback) {
        this.on(CHANGE_EVENT, callback);
    }

    removeChangeListener(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    }

    setFocus(focus) {
        this.inFocus = focus;
    }

    getFocus() {
        return this.inFocus;
    }
}

var NotificationStore = new NotificationStoreClass();

NotificationStore.dispatchToken = AppDispatcher.register((payload) => {
    const action = payload.action;

    switch (action.type) {
    case ActionTypes.BROWSER_CHANGE_FOCUS:
        NotificationStore.setFocus(action.focus);
        break;
    }
});

export default NotificationStore;
