// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Locator, Page} from '@playwright/test';

import {UserProfile} from '@mattermost/types/lib/users';

export class SignupPage {
    readonly page: Page;
    readonly title: Locator;
    readonly subtitle: Locator;
    readonly siteDescription: Locator;
    readonly emailInput: Locator;
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly createAccountButton: Locator;
    readonly loginLink: Locator;
    readonly emailError: Locator;
    readonly usernameError: Locator;
    readonly passwordError: Locator;
    readonly formContainer: Locator;

    constructor(page: Page) {
        this.page = page;

        this.title = page.locator('h1:has-text("Let\'s get started")');
        this.subtitle = page.locator('text=Create your Mattermost account to start collaborating with your team');
        this.emailInput = page.locator('#input_email');
        this.usernameInput = page.locator('#input_name');
        this.passwordInput = page.locator('#input_password-input');
        this.createAccountButton = page.locator('button:has-text("Create Account")');
        this.loginLink = page.locator('text=Click here to sign in.');
        this.emailError = page.locator('text=Please enter a valid email address');
        this.usernameError = page.locator(
            'text=Usernames have to begin with a lowercase letter and be 3-22 characters long. You can use lowercase letters, numbers, periods, dashes, and underscores.'
        );
        this.passwordError = page.locator('text=Must be 5-64 characters long.');
        this.formContainer = page.locator('.signup-team__container');
    }

    async goto() {
        await this.page.goto('/signup_email', {waitUntil: 'domcontentloaded'});
        await this.title.waitFor();
    }

    async create(user: Partial<UserProfile>, waitForRedirect = true) {
        await this.emailInput.fill(user.email);
        await this.usernameInput.fill(user.username);
        await this.passwordInput.fill(user.password);
        await this.createAccountButton.click();

        if (waitForRedirect) {
            await this.page.waitForNavigation();
        }
    }
}
