// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const express = require('express');
const axios = require('axios');

const webhookUtils = require('./utils/webhook_utils');

const postMessageAs = require('./cypress/plugins/post_message_as');
const users = require('./cypress/fixtures/users.json');

const port = 3000;

const server = express();
server.use(express.json());
server.use(express.urlencoded({extended: true}));

process.title = process.argv[2];

server.get('/', (req, res) => res.send('I\'m alive!\n'));
server.post('/message_menus', postMessageMenus);
server.post('/dialog_request', onDialogRequest);
server.post('/simple_dialog_request', onSimpleDialogRequest);
server.post('/user_and_channel_dialog_request', onUserAndChannelDialogRequest);
server.post('/dialog_submit', onDialogSubmit);
server.post('/boolean_dialog_request', onBooleanDialogRequest);
server.post('/slack_compatible_message_response', postSlackCompatibleMessageResponse);
server.post('/send_message_to_channel', postSendMessageToChannel);

server.listen(port, () => console.log(`Webhook test server listening on port ${port}!`)); // eslint-disable-line no-console

function postSlackCompatibleMessageResponse(req, res) {
    const {spoiler, skipSlackParsing} = req.body.context;

    res.setHeader('Content-Type', 'application/json');
    return res.json({
        ephemeral_text: spoiler,
        skip_slack_parsing: skipSlackParsing,
    });
}

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

function onUserAndChannelDialogRequest(req, res) {
    const {body} = req;
    if (body.trigger_id) {
        const webhookBaseUrl = getWebhookBaseUrl();
        const dialog = webhookUtils.getUserAndChannelDialog(body.trigger_id, webhookBaseUrl);
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

/**
 * @route "POST /send_message_to_channel?type={messageType}&channel_id={channelId}"
 * @query type - message type of empty string for regular message if not provided (default), "system_message", etc
 * @query channel_id - channel where to send the message
 */
function postSendMessageToChannel(req, res) {
    const channelId = req.query.channel_id;
    const response = {
        response_type: 'in_channel',
        text: 'Extra response 2',
        channel_id: channelId,
        extra_responses: [{
            response_type: 'in_channel',
            text: 'Hello World',
            channel_id: channelId,
        }],
    };

    if (req.query.type) {
        response.type = req.query.type;
    }

    res.json(response);
}

function getWebhookBaseUrl() {
    return process.env.CYPRESS_webhookBaseUrl || 'http://localhost:3000';
}

// Convenient way to send response in a channel by using sysadmin account
function sendSysadminResponse(message, channelId) {
    const baseUrl = process.env.CYPRESS_baseUrl || 'http://localhost:8065';
    postMessageAs({sender: users.sysadmin, message, channelId, baseUrl});
}
