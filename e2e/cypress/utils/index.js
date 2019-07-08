// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

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

export const reUrl = /(https?:\/\/[^ ]*)/;

