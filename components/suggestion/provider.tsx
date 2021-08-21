// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

export interface ResultCallbackParams {
    matchedPretext: string;
    terms: string[];
    items: any[];
    component: React.ElementType;
}

export default class Provider {
    latestPrefix: string;
    latestComplete: boolean;
    disableDispatches: boolean;
    requestStarted: boolean;

    constructor() {
        this.latestPrefix = '';
        this.latestComplete = true;
        this.disableDispatches = false;
        this.requestStarted = false;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    handlePretextChanged(pretext: string, resultCallback: (params: ResultCallbackParams) => any) {}

    resetRequest(): void {
        this.requestStarted = false;
    }

    startNewRequest(prefix: string): void {
        this.latestPrefix = prefix;
        this.latestComplete = false;
        this.requestStarted = true;
    }

    shouldCancelDispatch(prefix: string): boolean {
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

    allowDividers(): boolean {
        return true;
    }

    presentationType(): string {
        return 'text';
    }
}
