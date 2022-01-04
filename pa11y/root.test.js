// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const pa11y = require('pa11y');

const getConfig = (actions) => ({
    includeWarnings: true,
    timeout: 30000,
    standard: 'WCAG2A',
    rules: [],
    actions: Array.isArray(actions) ? actions : [],
});

pa11y('http://localhost:8065', getConfig()).then((results) => console.log('#### results', results));
pa11y('http://localhost:8065', getConfig([
    'wait for path to be /login',
    'set field #loginId to michel.engelen@mattermost.com',
    'set field #loginPassword to tkm3png@yce*EUJ2rnz',
    'click element #loginButton',
    'navigate to http://localhost:8065/artemis/channels/town-square',
])).then((results) => console.log('#### results', results));
