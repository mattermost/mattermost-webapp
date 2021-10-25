// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @account_setting

describe('Account Settings > Security > Password', () => {
    let testUser;
    let offTopic;

    before(() => {
        // # Login as new user and visit off-topic
        cy.apiInitSetup({loginAfter: true}).then(({user, offTopicUrl}) => {
            testUser = user;
            cy.visit(offTopicUrl);
            offTopic = offTopicUrl;
        });
    });

    beforeEach(() => {
        // # Reload the page to help run each test cleanly
        cy.reload();

        // # Go to Account Settings
        cy.uiOpenAccountSettingsModal('Security');

        // * Check that the Security tab is loaded
        cy.get('#securityButton').should('be.visible');

        // # Click the Security tab
        cy.get('#securityButton').click();

        // # Click "Edit" to the right of "Password"
        cy.get('#passwordEdit').should('be.visible').click();
    });

    it('MM-T2085 Password: Valid values in password change fields allow the form to save successfully', () => {
        // # Enter valid values in password change fields
        enterPasswords('passwd', 'passwd', 'passwd');

        // # Save the settings
        cy.uiSave();

        // * Check that there are no errors
        cy.get('#clientError').should('not.exist');
        cy.get('#serverError').should('not.exist');
    });

    it('MM-T2082 Password: New password confirmation mismatch produces error', () => {
        // # Enter mismatching passwords for new password and confirm fields
        enterPasswords('passwd', 'newPW', 'NewPW');

        // # Save
        cy.uiSave();

        // * Verify for error message: "The new passwords you entered do not match."
        cy.get('#clientError').should('be.visible').should('have.text', 'The new passwords you entered do not match.');
    });

    it('MM-T2083 Password: Too few characters in new password produces error', () => {
        // # Enter a New password two letters long
        enterPasswords('passwd', 'pw', 'pw');

        // # Save
        cy.uiSave();

        // * Verify for error message: "Your password must contain between 5 and 64 characters."
        cy.get('#clientError').should('be.visible').should('have.text', 'Your password must contain between 5 and 64 characters.');
    });

    it('MM-T2084 Password: Cancel out of password changes causes no changes to be made', () => {
        // # Enter new valid passwords
        enterPasswords('passwd', 'newPasswd', 'newPasswd');

        // # Click 'Cancel'
        cy.uiCancel();

        // * Check that user is no longer in password edit page to verify the 'Cancel' action
        cy.get('#currentPassword').should('not.exist');
        cy.get('#passwordEdit').should('be.visible');

        // # Logout
        cy.apiLogout();

        // * Verify that user cannot login with the cancelled password
        cy.get('#loginId').type(testUser.username);
        cy.get('#loginPassword').type('newPasswd');
        cy.get('#loginButton').click();
        cy.findByText('Enter a valid email or username and/or password.').should('be.visible');

        // * Verify that user can successfully login with the old password
        cy.apiLogin({username: testUser.username, password: 'passwd'});
        cy.visit(offTopic);
        cy.get('#channelHeaderTitle').should('contain', 'Off-Topic');
    });
});

function enterPasswords(currentPassword, newPassword, confirmPassword) {
    // # Enter Current password
    cy.get('#currentPassword').should('be.visible').type(currentPassword);

    // # Enter New password
    cy.get('#newPassword').should('be.visible').type(newPassword);

    // # Retype New password incorrectly
    cy.get('#confirmPassword').should('be.visible').type(confirmPassword);
}
