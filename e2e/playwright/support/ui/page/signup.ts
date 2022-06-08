// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {expect, Locator, Page} from '@playwright/test';

import {users, config} from '../../../../../packages/mattermost-redux/src/types';

export class SignupPage {
    readonly serverConfig: config.AdminConfig;

    readonly page: Page;
    readonly siteNameHeader: Locator;
    readonly siteDescription: Locator;
    readonly emailInput: Locator;
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly createAccountButton: Locator;
    readonly loginLink: Locator;
    readonly requiredErrorLabel: Locator;
    readonly fieldWithError: Locator;
    readonly formContainer: Locator;

    constructor(page: Page, serverConfig: config.AdminConfig) {
        this.page = page;
        this.serverConfig = serverConfig;

        const description =
            serverConfig.TeamSettings.CustomDescriptionText ||
            'All team communication in one place, searchable and accessible anywhere';

        this.siteNameHeader = page.locator(`h1:has-text("${serverConfig.TeamSettings.SiteName}")`);
        this.siteDescription = page.locator(`text=${description}`);
        this.emailInput = page.locator('[id="email"]');
        this.usernameInput = page.locator('[id="name"]');
        this.passwordInput = page.locator('[id="password"]');
        this.createAccountButton = page.locator('button:has-text("Create Account")');
        this.loginLink = page.locator('text=Click here to sign in.');
        this.requiredErrorLabel = page.locator('text=This field is required');
        this.fieldWithError = page.locator('.has-error');
        this.formContainer = page.locator('.signup-team__container');
    }

    async goto() {
        await this.page.goto('/signup_email', {waitUntil: 'domcontentloaded'});
        expect(await this.siteNameHeader).toBeVisible();
    }

    async create(user: users.UserProfile) {
        await this.emailInput.fill(user.email);
        await this.usernameInput.fill(user.username);
        await this.passwordInput.fill(user.password);
        await Promise.all([this.page.waitForNavigation(), this.createAccountButton.click()]);
    }
}
