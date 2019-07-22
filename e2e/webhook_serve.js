// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const webhookUtils = require('./utils/webhook_utils');

const port = 3000;

const server = express();
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));

process.title = process.argv[2];

server.get('/', (req, res) => res.send('I\'m alive!\n'));
server.post('/message_menus', postMessageMenus);
server.post('/dialog_request', onDialogRequest);
server.post('/dialog_submit', onDialogSubmit);

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

async function openDialog(triggerId) {
    const webhookBaseUrl = process.env.CYPRESS_webhookBaseUrl || 'http://localhost:3000';
    const dialog = webhookUtils.getFullDialog(triggerId, webhookBaseUrl);

    const baseUrl = process.env.CYPRESS_baseUrl || 'http://localhost:8065';
    await axios({
        method: 'post',
        url: `${baseUrl}/api/v4/actions/dialogs/open`,
        data: dialog,
    });
}

function onDialogRequest(req, res) {
    const {body} = req;
    const triggerId = body.trigger_id;
    if (body.trigger_id) {
        openDialog(triggerId);
    }

    res.setHeader('Content-Type', 'application/json');
    return res.json({text: 'Triggered via slash command!'});
}

function onDialogSubmit(req, res) {
    const {body} = req;

    res.setHeader('Content-Type', 'application/json');

    let message;
    if (body.cancelled) {
        message = 'Dialog cancelled';
    } else {
        message = 'Dialog submitted';
    }

    return res.json({text: message});
}
