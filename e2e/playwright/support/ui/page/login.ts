// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Locator, Page} from '@playwright/test';

import {users, config} from '../../../../../packages/mattermost-redux/src/types';

export class LoginPage {
    readonly adminConfig: config.AdminConfig;

    readonly page: Page;
    readonly siteNameHeader: Locator;
    readonly siteDescription: Locator;
    readonly loginInput: Locator;
    readonly passwordInput: Locator;
    readonly signInButton: Locator;
    readonly createAccountLink: Locator;
    readonly forgotPasswordLink: Locator;
    readonly userErrorLabel: Locator;
    readonly fieldWithError: Locator;
    readonly formContainer: Locator;

    constructor(page: Page, adminConfig: config.AdminConfig) {
        this.page = page;
        this.adminConfig = adminConfig;

        const loginInputPlaceholder = adminConfig.LdapSettings.Enable
            ? 'Email, Username or AD/LDAP Username'
            : 'Email or Username';
        const description =
            adminConfig.TeamSettings.CustomDescriptionText ||
            'All team communication in one place, searchable and accessible anywhere';

        this.siteNameHeader = page.locator(`h1:has-text("${adminConfig.TeamSettings.SiteName}")`);
        this.siteDescription = page.locator(`text=${description}`);
        this.loginInput = page.locator(`[placeholder="${loginInputPlaceholder}"]`);
        this.passwordInput = page.locator('[placeholder="Password"]');
        this.signInButton = page.locator('button:has-text("Sign in")');
        this.createAccountLink = page.locator('text=Create one now.');
        this.forgotPasswordLink = page.locator('text=I forgot my password.');
        this.userErrorLabel = page.locator('text=Please enter your email or username');
        this.fieldWithError = page.locator('.has-error');
        this.formContainer = page.locator('.signup-team__container');
    }

    async goto() {
        await this.page.goto('/login', {waitUntil: 'domcontentloaded'});
    }

    async login(user: users.UserProfile, useUsername = true) {
        await this.loginInput.fill(useUsername ? user.username : user.email);
        await this.passwordInput.fill(user.password);
        await Promise.all([this.page.waitForNavigation(), this.signInButton.click()]);
    }
}
