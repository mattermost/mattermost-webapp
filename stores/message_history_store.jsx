// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {PostTypes} from 'mattermost-redux/action_types';
import * as Selectors from 'mattermost-redux/selectors/entities/posts';

import Constants from 'utils/constants.jsx';
import store from 'stores/redux_store.jsx';

class MessageHistoryStoreClass {
    getMessageInHistory(type) {
        return Selectors.makeGetMessageInHistoryItem(type)(store.getState());
    }

    storeMessageInHistory(message) {
        store.dispatch({
            type: PostTypes.ADD_MESSAGE_INTO_HISTORY,
            data: message,
        });
    }

    storeMessageInHistoryByIndex(index, message) {
        store.dispatch({
            type: PostTypes.ADD_MESSAGE_INTO_HISTORY_INDEX,
            data: {message, index},
        });
    }

    resetAllHistoryIndex() {
        store.dispatch({
            type: PostTypes.RESET_ALL_HISTORY_INDEX,
        });
    }

    resetHistoryIndex(type) {
        store.dispatch({
            type: PostTypes.RESET_HISTORY_INDEX,
            data: type,
        });
    }

    nextMessageInHistory(keyCode, messageText, type) {
        if (messageText !== '' && messageText !== this.getMessageInHistory(type)) {
            return null;
        }

        if (keyCode === Constants.KeyCodes.UP) {
            store.dispatch({
                type: PostTypes.MOVE_HISTORY_INDEX_BACK,
                data: type,
            });
        } else if (keyCode === Constants.KeyCodes.DOWN) {
            store.dispatch({
                type: PostTypes.MOVE_HISTORY_INDEX_FORWARD,
                data: type,
            });
        }

        return this.getMessageInHistory(type);
    }
}

var MessageHistoryStore = new MessageHistoryStoreClass();

export default MessageHistoryStore;
