// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import dragster from './dragster';

describe('utils.dragster', () => {
    let div;
    let unbind;
    let enterEvent;
    let leaveEvent;
    let overEvent;
    let dropEvent;
    const id = 'utils_dragster_test';
    const dragenter = new CustomEvent('dragenter', {detail: 'dragenter_detail'});
    const dragleave = new CustomEvent('dragleave', {detail: 'dragleave_detail'});
    const dragover = new CustomEvent('dragover', {detail: 'dragover_detail'});
    const drop = new CustomEvent('drop', {detail: 'drop_detail'});
    const options = {
        enter: (event) => {
            enterEvent = event;
        },
        leave: (event) => {
            leaveEvent = event;
        },
        over: (event) => {
            overEvent = event;
        },
        drop: (event) => {
            dropEvent = event;
        },
    };

    beforeAll(() => {
        div = document.createElement('div');
        document.body.appendChild(div);
        div.setAttribute('id', id);
        unbind = dragster(`#${id}`, options);
    });

    afterAll(() => {
        unbind();
        div.remove();
    });

    afterEach(() => {
        enterEvent = null;
        leaveEvent = null;
        overEvent = null;
        dropEvent = null;
    });

    it('should dispatch dragenter event', () => {
        div.dispatchEvent(dragenter);

        expect(enterEvent.detail.detail).toEqual('dragenter_detail');
    });

    it('should dispatch dragleave event', () => {
        div.dispatchEvent(dragleave);

        expect(leaveEvent.detail.detail).toEqual('dragleave_detail');
    });

    it('should dispatch dragover event', () => {
        div.dispatchEvent(dragover);

        expect(overEvent.detail.detail).toEqual('dragover_detail');
    });

    it('should dispatch drop event', () => {
        div.dispatchEvent(drop);

        expect(dropEvent.detail.detail).toEqual('drop_detail');
    });

    it('should dispatch dragenter event again', () => {
        div.dispatchEvent(dragenter);

        expect(enterEvent.detail.detail).toEqual('dragenter_detail');
    });

    it('should dispatch dragenter event once if dispatched 2 times', () => {
        div.dispatchEvent(dragenter);

        expect(enterEvent).toBe(null);
    });
});
