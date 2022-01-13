// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

const pa11y = require('pa11y');

const {getConfig, actionSets, usePa11yHelper} = require('./helper');

const [initialActions, pa11yHelper] = usePa11yHelper('artemis');

pa11y('http://localhost:8065', getConfig()).then((results) => console.log('#### results', results));
pa11y('http://localhost:8065', getConfig(pa11yHelper)).then((results) => console.log('#### results', results));
