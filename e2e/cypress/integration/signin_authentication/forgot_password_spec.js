// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @signin_authentication

import {
    Constants,
    getEmailUrl,
    reUrl,
    splitEmailBodyText,
} from '../../utils';

describe('Signin/Authentication', () => {
    let testUser;
    let testTeam;
    let testConfig;

    before(() => {
        // # Do email test if setup properly
        cy.apiEmailTest();

        // # Get config
        cy.apiGetConfig().then(({config}) => {
            testConfig = config;
        });

        // # Create new team and users
        cy.apiInitSetup().then(({team, user}) => {
            testUser = user;
            testTeam = team;

            cy.apiLogout();
        });
    });

    it('MM-T407 - Sign In Forgot password - Email address has account on server', () => {
        resetPasswordAndLogin(testUser, testTeam, testConfig);
    });
});

function verifyForgotPasswordEmail(response, toUser, config) {
    const isoDate = new Date().toISOString().substring(0, 10);
    const {data, status} = response;
    const {
        EmailSettings: {FeedbackEmail},
        ServiceSettings: {SiteURL},
        SupportSettings: {SupportEmail},
        TeamSettings: {SiteName},
    } = config;

    // * Should return success status
    expect(status).to.equal(200);

    // * Verify that email is addressed to toUser
    expect(data.to.length).to.equal(1);
    expect(data.to[0]).to.contain(toUser.email);

    // * Verify that email is from default feedback email
    expect(data.from).to.contain(FeedbackEmail || Constants.FixedCloudConfig.EmailSettings.FEEDBACK_EMAIL);

    // * Verify that date is current
    expect(data.date).to.contain(isoDate);

    // * Verify that the email subject is correct
    expect(data.subject).to.equal(`[${SiteName}] Reset your password`);

    // * Verify that the email body is correct
    const bodyText = splitEmailBodyText(data.body.text);
    expect(bodyText.length).to.equal(11);
    expect(bodyText[0]).to.equal('Reset Your Password');
    expect(bodyText[1]).to.equal('Click the button below to reset your password. If you didn’t request this, you can safely ignore this email.');
    expect(bodyText[3]).to.contain(`Reset Password ( ${SiteURL}/reset_password_complete?token=`);
    expect(bodyText[5]).to.contain('The password reset link expires in 24 hours.');
    expect(bodyText[7]).to.contain('Questions?');
    expect(bodyText[8]).to.equal(`Email us any time at ${SupportEmail} ( ${SupportEmail} )`);
    expect(bodyText[10]).to.equal('© 2021 Mattermost, Inc. 530 Lytton Avenue, Second floor, Palo Alto, CA, 94301');
}

function resetPasswordAndLogin(user, team, config) {
    const newPassword = 'newpasswd';

    // # Visit town-square
    cy.visit(`/${team.name}/channels/town-square`);

    // * Verify that it redirects to /login
    cy.url().should('contain', '/login');

    // * Verify that forgot password link is present
    // # Click forgot password link
    cy.get('#login_forgot > a').should('be.visible').and('have.text', 'I forgot my password.').click();

    // * Verify that it redirects to /reset_password
    cy.url().should('contain', '/reset_password');

    // * Verify that the focus is set to passwordResetEmailInput
    cy.focused().should('have.attr', 'id', 'passwordResetEmailInput');

    // # Type user email into email input field and click reset button
    cy.get('#passwordResetEmailInput').type(user.email);
    cy.get('#passwordResetButton').click();

    // * Should show that the  password reset email is sent
    cy.get('#passwordResetEmailSent').should('be.visible').within(() => {
        cy.get('span').first().should('have.text', 'If the account exists, a password reset email will be sent to:');
        cy.get('div b').first().should('have.text', user.email);
        cy.get('span').last().should('have.text', 'Please check your inbox.');
    });

    const baseUrl = Cypress.config('baseUrl');
    const mailUrl = getEmailUrl(baseUrl);

    cy.task('getRecentEmail', {username: user.username, mailUrl}).then((response) => {
        // * Verify contents password reset email
        verifyForgotPasswordEmail(response, user, config);

        const bodyText = splitEmailBodyText(response.data.body.text);
        const passwordResetLink = bodyText[3].match(reUrl)[0];
        const token = passwordResetLink.split('token=')[1];

        // * Verify length of a token
        expect(token.length).to.equal(64);

        // # Visit password reset link (e.g. click on email link)
        cy.visit(passwordResetLink);
        cy.url().should('contain', '/reset_password_complete?token=');

        // * Verify that the focus is set to resetPasswordInput
        cy.focused().should('have.attr', 'id', 'resetPasswordInput');

        // # Type new password and click reset button
        cy.get('#resetPasswordInput').type(newPassword);
        cy.get('#resetPasswordButton').click();

        // * Verify that it redirects to /login?extra=password_change
        cy.url().should('contain', '/login?extra=password_change');

        // * Should show that the password is updated successfully
        cy.get('#passwordUpdatedSuccess').should('be.visible').and('have.text', ' Password updated successfully');

        // # Type email and new password, then click login button
        cy.get('#loginId').should('be.visible').type(user.username);
        cy.get('#loginPassword').should('be.visible').type(newPassword);
        cy.get('#loginButton').click();

        // * Verify that it successfully logged in and redirects to /channels/town-square
        cy.url().should('contain', `/${team.name}/channels/town-square`);

        // # Logout
        cy.apiLogout();
    });
}
