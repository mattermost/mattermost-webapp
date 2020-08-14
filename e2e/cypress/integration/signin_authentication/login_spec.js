// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @signin_authentication

describe('Login page', () => {
    let config;
    let testUser;

    before(() => {
        // Disable other auth options
        const newSettings = {
            Office365Settings: {Enable: false},
            LdapSettings: {Enable: false},
        };
        cy.apiUpdateConfig(newSettings).then((data) => {
            ({config} = data);
        });

        // # Create new team and users
        cy.apiInitSetup().then(({user}) => {
            testUser = user;

            cy.apiLogout();
            cy.visit('/login');
        });
    });

    it('MM-T3306_1 Should render all elements of the page', () => {
        // * Verify URL is of login page
        cy.url().should('include', '/login');

        // * Verify title of the document is correct
        cy.title().should('include', config.TeamSettings.SiteName);

        // * Verify email/username field is present
        cy.findByPlaceholderText('Email or Username').should('exist').and('be.visible');

        // * Verify possword is present
        cy.findByPlaceholderText('Password').should('exist').and('be.visible');

        // * Verify sign in button is present
        cy.findByText('Sign in').should('exist').and('be.visible');

        // * Verify forget password link is present
        cy.findByText('I forgot my password.').should('exist').and('be.visible').
            parent().should('have.attr', 'href', '/reset_password');

        // * Verify create an account link is present
        cy.findByText('Don\'t have an account?').should('exist').and('be.visible');
        cy.findByText('Create one now.').should('exist').and('be.visible').
            parent().should('have.attr', 'href', '/signup_user_complete');

        // * Check if site name is visible on top of login section
        cy.get('#login_section').within(() => {
            cy.findByText(config.TeamSettings.SiteName).should('exist').and('be.visible');
        });

        // # Move inside of footer section
        cy.get('#footer_section').should('exist').and('be.visible').within(() => {
            // * Check if about footer link is present
            cy.findByText('About').should('exist').
                parent().and('have.attr', 'href', config.SupportSettings.AboutLink);

            // * Check if privacy footer link is present
            cy.findByText('Privacy').should('exist').
                parent().and('have.attr', 'href', config.SupportSettings.PrivacyPolicyLink);

            // * Check if terms footer link is present
            cy.findByText('Terms').should('exist').
                parent().and('have.attr', 'href', config.SupportSettings.TermsOfServiceLink);

            // * Check if help footer link is present
            cy.findByText('Help').should('exist').
                parent().and('have.attr', 'href', config.SupportSettings.HelpLink);

            const todaysDate = new Date();
            const currentYear = todaysDate.getFullYear();

            // * Check if copyright footer is present
            cy.findByText(`© 2015-${currentYear} Mattermost, Inc.`).should('exist');
        });
    });

    it('MM-T3306_2 Should autofocus on email field on page load', () => {
        // * Check the focused element has the placeholder of email/username
        cy.focused().should('have.attr', 'placeholder', 'Email or Username');
    });

    it('MM-T3306_3 Should show error with empty email/username and password field', () => {
        // # Clear email/username field
        cy.findByPlaceholderText('Email or Username').clear();

        // # Clear password field
        cy.findByPlaceholderText('Password').clear();

        // # Hit enter to login
        cy.findByText('Sign in').click();

        // * Verify appropriate error message is displayed for empty email/username and password
        cy.findByText('Please enter your email or username').should('exist').and('be.visible');
    });

    it('MM-T3306_4 Should show error with empty email/username field', () => {
        // # Clear email/username field
        cy.findByPlaceholderText('Email or Username').clear();

        // # Enter a password
        cy.findByPlaceholderText('Password').clear().type('samplepassword');

        // # Hit enter to login
        cy.findByText('Sign in').click();

        // * Verify appropriate error message is displayed for empty email/username
        cy.findByText('Please enter your email or username').should('exist').and('be.visible');
    });

    it('MM-T3306_5 Should show error with empty password field', () => {
        // # Enter any email/username in the email field
        cy.findByPlaceholderText('Email or Username').clear().type('sampleusername');

        // # Clear password field
        cy.findByPlaceholderText('Password').clear();

        // # Hit enter to login
        cy.findByText('Sign in').click();

        // * Verify appropriate error message is displayed for empty password
        cy.findByText('Please enter your password').should('exist').and('be.visible');
    });

    it('MM-T3306_6 Should show error with invalid email/username and password', () => {
        const invalidEmail = `${Date.now()}-user`;
        const invalidPassword = `${Date.now()}-password`;

        // # Lets verify generated email is not an actual email/username
        expect(invalidEmail).to.not.equal(testUser.username);

        // # Lets verify generated password is not an actual password
        expect(invalidPassword).to.not.equal(testUser.password);

        // # Enter invalid email/username in the email field
        cy.findByPlaceholderText('Email or Username').clear().type(invalidEmail);

        // # Enter invalid password in the password field
        cy.findByPlaceholderText('Password').clear().type(invalidPassword);

        // # Hit enter to login
        cy.findByText('Sign in').click();

        // * Verify appropriate error message is displayed for incorrect email/username and password
        cy.findByText('Enter a valid email or username and/or password.').should('exist').and('be.visible');
    });

    it('MM-T3306_7 Should show error with invalid password', () => {
        const invalidPassword = `${Date.now()}-password`;

        // # Lets verify generated password is not an actual password
        expect(invalidPassword).to.not.equal(testUser.password);

        // # Enter actual users email/username in the email field
        cy.findByPlaceholderText('Email or Username').clear().type(testUser.username);

        // # Enter invalid password in the password field
        cy.findByPlaceholderText('Password').clear().type(invalidPassword);

        // # Hit enter to login
        cy.findByText('Sign in').click();

        // * Verify appropriate error message is displayed for incorrect password
        cy.findByText('Enter a valid email or username and/or password.').should('exist').and('be.visible');
    });

    it('MM-T3306_8 Should login with a valid email and password and logout', () => {
        // # Enter actual users email/username in the email field
        cy.findByPlaceholderText('Email or Username').clear().type(testUser.username);

        // # Enter any password in the email field
        cy.findByPlaceholderText('Password').clear().type(testUser.password);

        // # Hit enter to login
        cy.findByText('Sign in').click();

        // * Check that it login successfully and it redirects into the main channel page
        cy.url().should('include', '/channels/town-square');

        // # Click hamburger main menu button
        cy.findByLabelText('main menu').should('exist').and('be.visible').click();

        // # Click on the logout menu
        cy.findByText('Log Out').should('exist').and('be.visible').click();

        // * Check that it logout successfully and it redirects into the login page
        cy.url().should('include', '/login');
    });
});
