// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-loop-func, quote-props */

import {v4 as uuidv4} from 'uuid';

import messageMenusData from '../fixtures/hooks/message_menus.json';
import messageMenusWithDatasourceData from '../fixtures/hooks/message_menus_with_datasource.json';

import Constants from './constants';

/**
 * @param {Number} length - length on random string to return, e.g. 7 (default)
 * @return {String} random string
 */
export function getRandomId(length = 7) {
    const MAX_SUBSTRING_INDEX = 27;

    return uuidv4().replace(/-/g, '').substring(MAX_SUBSTRING_INDEX - length, MAX_SUBSTRING_INDEX);
}

export function getEmailUrl() {
    const smtpUrl = Cypress.env('smtpUrl') || 'http://localhost:10080';

    return `${smtpUrl}/api/v1/mailbox`;
}

export function getMessageMenusPayload({dataSource, options, prefix = Date.now()} = {}) {
    let data;
    if (dataSource) {
        data = messageMenusWithDatasourceData;
        data.attachments[0].actions[0].data_source = dataSource;
        data.attachments[0].pretext = `${prefix}: This is attachment pretext with ${dataSource} options`;
        data.attachments[0].text = `${prefix}: This is attachment text with ${dataSource} options`;
    } else {
        data = messageMenusData;
        data.attachments[0].pretext = `${prefix}: This is attachment pretext with basic options`;
        data.attachments[0].text = `${prefix}: This is attachment text with basic options`;

        if (options) {
            data.attachments[0].actions[0].options = options;
        }
    }

    const callbackUrl = Cypress.env().webhookBaseUrl + '/message_menus';
    data.attachments[0].actions[0].integration.url = callbackUrl;

    return data;
}

export function hexToRgbArray(hex) {
    var rgbArr = hex.replace('#', '').match(/.{1,2}/g);
    return [
        parseInt(rgbArr[0], 16),
        parseInt(rgbArr[1], 16),
        parseInt(rgbArr[2], 16),
    ];
}

export function rgbArrayToString(rgbArr) {
    return `rgb(${rgbArr[0]}, ${rgbArr[1]}, ${rgbArr[2]})`;
}

export const reUrl = /(https?:\/\/[^ ]*)/;

// Stubs out the clipboard so that we can intercept copy events. Note that this only stubs out calls to
// navigator.clipboard.writeText and not document.execCommand.
export function stubClipboard() {
    const clipboard = {contents: '', wasCalled: false};

    cy.window().then((win) => {
        cy.stub(win.navigator.clipboard, 'writeText', (link) => {
            clipboard.wasCalled = true;
            clipboard.contents = link;
        });
    });

    return cy.wrap(clipboard);
}

export {
    Constants,
};
