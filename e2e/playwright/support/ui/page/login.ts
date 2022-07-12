// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Locator, Page} from '@playwright/test';

import {AdminConfig} from '@mattermost/types/lib/config';
import {UserProfile} from '@mattermost/types/lib/users';

export class LoginPage {
    readonly adminConfig: AdminConfig;

    readonly page: Page;
    readonly title: Locator;
    readonly subtitle: Locator;
    readonly loginInput: Locator;
    readonly loginPlaceholder: Locator;
    readonly passwordInput: Locator;
    readonly signInButton: Locator;
    readonly createAccountLink: Locator;
    readonly forgotPasswordLink: Locator;
    readonly userErrorLabel: Locator;
    readonly fieldWithError: Locator;
    readonly formContainer: Locator;

    constructor(page: Page, adminConfig: AdminConfig) {
        this.page = page;
        this.adminConfig = adminConfig;

        const loginInputPlaceholder = adminConfig.LdapSettings.Enable
            ? 'Email, Username or AD/LDAP Username'
            : 'Email or Username';

        this.title = page.locator('h1:has-text("Log in to your account")');
        this.subtitle = page.locator('text=Collaborate with your team in real-time');
        this.loginInput = page.locator('#input_loginId');
        this.loginPlaceholder = page.locator(`[placeholder="${loginInputPlaceholder}"]`);
        this.passwordInput = page.locator('#input_password-input');
        this.signInButton = page.locator('button:has-text("Log in")');
        this.createAccountLink = page.locator('text=Create an account');
        this.forgotPasswordLink = page.locator('text=Forgot your password?');
        this.userErrorLabel = page.locator('text=Please enter your email or username');
        this.fieldWithError = page.locator('.with-error');
        this.formContainer = page.locator('.signup-team__container');
    }

    async goto() {
        await this.page.goto('/login', {waitUntil: 'domcontentloaded'});
    }

    async login(user: Partial<UserProfile>, useUsername = true) {
        await this.loginInput.fill(useUsername ? user.username : user.email);
        await this.passwordInput.fill(user.password);
        await Promise.all([this.page.waitForNavigation(), this.signInButton.click()]);
    }
}
