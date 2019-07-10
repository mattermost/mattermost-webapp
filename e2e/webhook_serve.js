// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const express = require('express');
const bodyParser = require('body-parser');
const port = 3000;

const server = express();
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));

process.title = process.argv[2];

server.post('/message_menus', postMessageMenus);

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
