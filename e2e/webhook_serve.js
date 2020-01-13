// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const webhookUtils = require('./utils/webhook_utils');

const postMessageAs = require('./cypress/plugins/post_message_as');
const users = require('./cypress/fixtures/users.json');

const port = 3000;

const server = express();
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));

process.title = process.argv[2];

server.get('/', (req, res) => res.send('I\'m alive!\n'));
server.post('/message_menus', postMessageMenus);
server.post('/dialog_request', onDialogRequest);
server.post('/simple_dialog_request', onSimpleDialogRequest);
server.post('/dialog_submit', onDialogSubmit);
server.post('/boolean_dialog_request', onBooleanDialogRequest);

server.listen(port, () => console.log(`Webhook test server listening on port ${port}!`)); // eslint-disable-line no-console

function postMessageMenus(req, res) {
    let responseData = {};
    const {body} = req;
    if (body && body.context.action === 'do_something') {
        responseData = {
            ephemeral_text: `Ephemeral | ${body.type} ${body.data_source} option: ${body.context.selected_option}`,
        };
    }

    res.setHeader('Content-Type', 'application/json');
    return res.json(responseData);
}

async function openDialog(dialog) {
    const baseUrl = process.env.CYPRESS_baseUrl || 'http://localhost:8065';
    await axios({
        method: 'post',
        url: `${baseUrl}/api/v4/actions/dialogs/open`,
        data: dialog,
    });
}

function onDialogRequest(req, res) {
    const {body} = req;
    if (body.trigger_id) {
        const webhookBaseUrl = getWebhookBaseUrl();
        const dialog = webhookUtils.getFullDialog(body.trigger_id, webhookBaseUrl);
        openDialog(dialog);
    }

    res.setHeader('Content-Type', 'application/json');
    return res.json({text: 'Full dialog triggered via slash command!'});
}

function onSimpleDialogRequest(req, res) {
    const {body} = req;
    if (body.trigger_id) {
        const webhookBaseUrl = getWebhookBaseUrl();
        const dialog = webhookUtils.getSimpleDialog(body.trigger_id, webhookBaseUrl);
        openDialog(dialog);
    }

    res.setHeader('Content-Type', 'application/json');
    return res.json({text: 'Simple dialog triggered via slash command!'});
}

function onBooleanDialogRequest(req, res) {
    const {body} = req;
    if (body.trigger_id) {
        const webhookBaseUrl = getWebhookBaseUrl();
        const dialog = webhookUtils.getBooleanDialog(body.trigger_id, webhookBaseUrl);
        openDialog(dialog);
    }

    res.setHeader('Content-Type', 'application/json');
    return res.json({text: 'Simple dialog triggered via slash command!'});
}

function onDialogSubmit(req, res) {
    const {body} = req;

    res.setHeader('Content-Type', 'application/json');

    let message;
    if (body.cancelled) {
        message = 'Dialog cancelled';
        sendSysadminResponse(message, body.channel_id);
    } else {
        message = 'Dialog submitted';
        sendSysadminResponse(message, body.channel_id);
    }

    return res.json({text: message});
}

function getWebhookBaseUrl() {
    return process.env.CYPRESS_webhookBaseUrl || 'http://localhost:3000';
}

// Convenient way to send response in a channel by using sysadmin account
function sendSysadminResponse(message, channelId) {
    const baseUrl = process.env.CYPRESS_baseUrl || 'http://localhost:8065';
    postMessageAs({sender: users.sysadmin, message, channelId, baseUrl});
}
