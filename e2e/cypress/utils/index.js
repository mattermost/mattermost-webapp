// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import messageMenusData from '../fixtures/hooks/message_menus.json';
import messageMenusWithDatasourceData from '../fixtures/hooks/message_menus_with_datasource.json';

export function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

export function getEmailUrl(baseUrl) {
    if (baseUrl === 'http://localhost:8065') {
        return 'http://localhost:10080/api/v1/mailbox';
    }

    return `${baseUrl}/mail`;
}

export function getEmailMessageSeparator(baseUrl) {
    if (baseUrl === 'http://localhost:8065') {
        return '\r\n';
    }

    return '\n';
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

export function titleCase(str) {
    const splitStr = str.toLowerCase().split(' ');

    for (let i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }

    return splitStr.join(' ');
}

export const reUrl = /(https?:\/\/[^ ]*)/;
