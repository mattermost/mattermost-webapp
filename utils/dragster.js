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
    const node = document.querySelector(query);

    if (!node) {
        return noop;
    }

    let first = false;
    let second = false;

    const dragenter = (event) => {
        if (first) {
            second = true;
            return;
        }

        first = true;
        const enterEvent = new CustomEvent('dragster:enter', {detail: event});
        node.dispatchEvent(enterEvent);

        event.preventDefault();
    };

    const dragleave = (event) => {
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
    };

    const dragover = (event) => {
        const overEvent = new CustomEvent('dragster:over', {detail: event});
        node.dispatchEvent(overEvent);
        event.preventDefault();
    };

    const drop = (event) => {
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
    };

    node.addEventListener('dragenter', dragenter);
    node.addEventListener('dragleave', dragleave);
    node.addEventListener('dragover', dragover);
    node.addEventListener('drop', drop);

    node.addEventListener('dragster:enter', settings.enter);
    node.addEventListener('dragster:leave', settings.leave);
    node.addEventListener('dragster:over', settings.over);
    node.addEventListener('dragster:drop', settings.drop);

    const unbindEvents = () => {
        node.removeEventListener('dragenter', dragenter);
        node.removeEventListener('dragleave', dragleave);
        node.removeEventListener('dragover', dragover);
        node.removeEventListener('drop', drop);

        node.removeEventListener('dragster:enter', settings.enter);
        node.removeEventListener('dragster:leave', settings.leave);
        node.removeEventListener('dragster:over', settings.over);
        node.removeEventListener('dragster:drop', settings.drop);
    };

    return unbindEvents;
}

