// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***********************************************************
// Read more at: https://on.cypress.io/configuration
// ***********************************************************

import './ui_commands';
import './api_commands';
import 'cypress-file-upload';

// Add login cookies to whitelist to preserve it
Cypress.Cookies.defaults({
    whitelist: ['MMAUTHTOKEN', 'MMUSERID', 'MMCSRF'],
});
