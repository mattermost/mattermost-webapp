import {request, Browser} from '@playwright/test';

import {UserProfile} from '@mattermost/types/users';

import testConfig from '@e2e-test.config';

export async function loginByAPIRequestContext(loginId: string, password: string, token = '', ldapOnly = false) {
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

    // Save signed-in state to 'storageState.json'.
    const storagePath = `storage_state/${Date.now()}_${loginId}_${password}${token ? '_' + token : ''}${
        ldapOnly ? '_ldap' : ''
    }.json`;
    await requestContext.storageState({path: storagePath});
    await requestContext.dispose();

    return storagePath;
}

export async function newBrowserContext(browser: Browser, user: UserProfile) {
    // Log in via API request and save user storage
    const storagePath = await loginByAPIRequestContext(user.username, user.password);

    // Sign in user in new context
    const context = await browser.newContext({storageState: storagePath});

    return context;
}
