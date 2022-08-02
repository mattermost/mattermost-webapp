// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export default class Provider {
    constructor() {
        this.latestPrefix = '';
        this.latestComplete = true;
        this.disableDispatches = false;
        this.requestStarted = false;
    }

    handlePretextChanged(pretext, callback) { // eslint-disable-line no-unused-vars
        // NO-OP for inherited classes to override
    }

    resetRequest() {
        this.requestStarted = false;
    }

    startNewRequest(prefix) {
        this.latestPrefix = prefix;
        this.latestComplete = false;
        this.requestStarted = true;
    }

    shouldCancelDispatch(prefix) {
        if (this.disableDispatches) {
            return true;
        }

        if (!this.requestStarted) {
            return true;
        }

        if (prefix === this.latestPrefix) {
            this.latestComplete = true;
        } else if (this.latestComplete) {
            return true;
        }

        return false;
    }

    allowDividers() {
        return true;
    }

    presentationType() {
        return 'text';
    }
}
