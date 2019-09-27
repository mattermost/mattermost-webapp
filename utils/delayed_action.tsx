// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export default class DelayedAction {
    private action: Function;
    private timer: number;

    constructor(action: Function) {
        this.action = action;

        this.timer = -1;

        // bind fire since it doesn't get passed the correct this value with setTimeout
        this.fire = this.fire.bind(this);
    }

    fire() {
        this.action();

        this.timer = -1;
    }

    fireAfter(timeout: number) {
        if (this.timer >= 0) {
            window.clearTimeout(this.timer);
        }

        this.timer = window.setTimeout(this.fire, timeout);
    }

    cancel() {
        window.clearTimeout(this.timer);
    }
}
