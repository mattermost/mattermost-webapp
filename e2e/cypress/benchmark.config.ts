// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {defineConfig} from 'cypress';

import defaultConfig from './cypress.config';

export default defineConfig({
    ...defaultConfig,
    defaultCommandTimeout: 60000,
});
