// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export default function dragster(query, options) {
    const noop = () => {}; // eslint-disable-line no-empty-function

    const defaults = {
        enter: noop,
        leave: noop,
        over: noop,
        drop: noop,
    };

    const settings = Object.assign(defaults, options);
    const nodes = document.querySelectorAll(query);

    nodes.forEach((node) => {
        let first = false;
        let second = false;

        node.addEventListener('dragenter', (event) => {
            if (first) {
                second = true;
                return;
            }

            first = true;
            const enterEvent = new CustomEvent('dragster:enter', {detail: event});
            node.dispatchEvent(enterEvent);

            event.preventDefault();
        });

        node.addEventListener('dragleave', (event) => {
            if (second) {
                second = false;
            } else if (first) {
                first = false;
            }
            if (!first && !second) {
                const leaveEvent = new CustomEvent('dragster:leave', {detail: event});
                node.dispatchEvent(leaveEvent);
            }
            event.preventDefault();
        });

        node.addEventListener('dragover', (event) => {
            const overEvent = new CustomEvent('dragster:over', {detail: event});
            node.dispatchEvent(overEvent);
            event.preventDefault();
        });

        node.addEventListener('drop', (event) => {
            if (second) {
                second = false;
            } else if (first) {
                first = false;
            }
            if (!first && !second) {
                const dropEvent = new CustomEvent('dragster:drop', {detail: event});
                node.dispatchEvent(dropEvent);
            }
            event.preventDefault();
        });

        node.addEventListener('dragster:enter', settings.enter);
        node.addEventListener('dragster:leave', settings.leave);
        node.addEventListener('dragster:over', settings.over);
        node.addEventListener('dragster:drop', settings.drop);
    });
}

