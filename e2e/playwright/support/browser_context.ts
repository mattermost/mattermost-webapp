// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {writeFile} from 'node:fs/promises';

import {request, Browser} from '@playwright/test';

import {UserProfile} from '@mattermost/types/users';
import testConfig from '@e2e-test.config';

export class TestBrowser {
    readonly browser: Browser;

    constructor(browser: Browser) {
        this.browser = browser;
    }

    async login(user: UserProfile) {
        // Log in via API request and save user storage
        const storagePath = await loginByAPI(user.username, user.password);

        // Sign in a user in new browser context
        const context = await this.browser.newContext({storageState: storagePath});
        const page = await context.newPage();

        return {context, page};
    }
}

export async function loginByAPI(loginId: string, password: string, token = '', ldapOnly = false) {
    const requestContext = await request.newContext();

    const data: any = {
        login_id: loginId,
        password,
        token,
        deviceId: '',
    };

    if (ldapOnly) {
        data.ldap_only = 'true';
    }

    // Log in via API
    await requestContext.post(`${testConfig.baseURL}/api/v4/users/login`, {
        data,
        headers: {'X-Requested-With': 'XMLHttpRequest'},
    });

    // Save signed-in state to a folder
    const storagePath = `storage_state/${Date.now()}_${loginId}_${password}${token ? '_' + token : ''}${
        ldapOnly ? '_ldap' : ''
    }.json`;
    const storageState = await requestContext.storageState({path: storagePath});
    await requestContext.dispose();

    // Append origins to bypass seeing landing page then write to file
    storageState.origins.push({
        origin: testConfig.baseURL,
        localStorage: [{name: '__landingPageSeen__', value: 'true'}],
    });
    await writeFile(storagePath, JSON.stringify(storageState));

    return storagePath;
}
