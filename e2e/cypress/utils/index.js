// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import messageMenusData from '../fixtures/hooks/message_menus.json';
import messageMenusWithDatasourceData from '../fixtures/hooks/message_menus_with_datasource.json';

export function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

export function getEmailUrl(baseUrl) {
    if (baseUrl === 'http://localhost:8065') {
        return 'http://localhost:9000/api/v1/mailbox';
    }

    return `${baseUrl}/mail`;
}

export function getEmailMessageSeparator(baseUrl) {
    if (baseUrl === 'http://localhost:8065') {
        return '\r\n';
    }

    return '\n';
}

export function getMessageMenusPayload({dataSource, options} = {}) {
    let data;
    if (dataSource) {
        data = messageMenusWithDatasourceData;
        data.attachments[0].actions[0].data_source = dataSource;
        data.attachments[0].pretext = `This is attachment pretext with ${dataSource} options`;
        data.attachments[0].text = `This is attachment text with ${dataSource} options`;
    } else {
        data = messageMenusData;
        data.attachments[0].pretext = 'This is attachment pretext with basic options';
        data.attachments[0].text = 'This is attachment text with basic options';

        if (options) {
            data.attachments[0].actions[0].options = options;
        }
    }

    const callbackUrl = Cypress.env().webhookBaseUrl + '/message_menus';
    data.attachments[0].actions[0].integration.url = callbackUrl;

    return data;
}

export const reUrl = /(https?:\/\/[^ ]*)/;

