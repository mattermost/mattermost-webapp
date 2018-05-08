// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import EventEmitter from 'events';

import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import EventTypes from 'utils/event_types.jsx';

class GlobalEventEmitterClass extends EventEmitter {
    constructor() {
        super();
        this.dispatchToken = AppDispatcher.register(this.handleEventPayload);
    }

    handleEventPayload = (payload) => {
        const {type, value, ...args} = payload.action; //eslint-disable-line no-use-before-define

        switch (type) {
        case EventTypes.POST_LIST_SCROLL_CHANGE:
            this.emit(type, value, args);
            break;
        }
    }
}

const GlobalEventEmitter = new GlobalEventEmitterClass();
export default GlobalEventEmitter;
