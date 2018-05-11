// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export default class Provider {
    constructor() {
        this.latestPrefix = '';
        this.latestComplete = true;
        this.disableDispatches = false;
    }

    handlePretextChanged(suggestionId, pretext) { // eslint-disable-line no-unused-vars
        // NO-OP for inherited classes to override
    }

    startNewRequest(suggestionId, prefix) {
        this.latestPrefix = prefix;
        this.latestComplete = false;
    }

    shouldCancelDispatch(prefix) {
        if (this.disableDispatches) {
            return true;
        }

        if (prefix === this.latestPrefix) {
            this.latestComplete = true;
        } else if (this.latestComplete) {
            return true;
        }

        return false;
    }
}
