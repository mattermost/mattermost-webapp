// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @onboarding @cloud_only

describe('Cloud Onboarding - Sysadmin', () => {
    let townSquarePage;
    let sysadmin;

    before(() => {
        cy.apiRequireLicenseForFeature('Cloud');

        cy.apiInitSetup().then(({team}) => {
            townSquarePage = `/${team.name}/channels/town-square`;
        });

        cy.apiAdminLogin().then((res) => {
            sysadmin = res.user;
        });
    });

    beforeEach(() => {
        // # Login as sysadmin and set all steps to false
        const preference = {
            user_id: sysadmin.id,
            category: 'recommended_next_steps',
            value: 'false',
        };
        const adminSteps = [
            'complete_profile',
            'notification_setup',
            'team_setup',
            'invite_members',
            'hide',
            'skip',
        ];

        cy.apiSaveUserPreference(adminSteps.map((step) => ({...preference, name: step})));
        cy.visit(townSquarePage);
    });

    it('MM-T3330_1 Sysadmin - Set full name and profile image', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // # Clear full name
        cy.apiPatchUser(sysadmin.id, {first_name: '', last_name: ''}).then(() => {
            // * Check to make sure card is expanded
            cy.get('.Card__body.expanded .CompleteProfileStep').should('be.visible');

            // # Clear full name input
            cy.get('#input_fullName').should('be.visible').clear();

            // * Save profile should be disabled
            cy.findByTestId('CompleteProfileStep__saveProfileButton').should('be.disabled');

            // # Enter full name
            cy.get('#input_fullName').should('be.visible').clear().type('Theodore Logan');

            // # Select profile picture
            cy.findByTestId('PictureSelector__input-CompleteProfileStep__profilePicture').attachFile('mattermost-icon.png');

            // # Click Save profile button
            cy.findByTestId('CompleteProfileStep__saveProfileButton').should('be.visible').and('not.be.disabled').click();

            // * Check to make sure card is collapsed and step is complete
            cy.get('.Card.complete .CompleteProfileStep').should('exist');

            // * Step counter should increment
            cy.get('.SidebarNextSteps .SidebarNextSteps__middle').should('contain', '1 / 4 steps complete');
        });
    });

    it('MM-T3330_2 Sysadmin - Set full name and profile image - no name provided', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .CompleteProfileStep').should('be.visible');

        // # Clear full name box
        cy.get('#input_fullName').should('be.visible').type('Theodore Logan').clear();

        // * Verify error message is displayed
        cy.get('.CompleteProfileStep__fullName .Input___error span').should('contain', 'Your name cannot be blank');

        // * Save profile should be disabled
        cy.findByTestId('CompleteProfileStep__saveProfileButton').should('be.disabled');
    });

    it('MM-T3330_3 Sysadmin - Set full name and profile image - upload file of wrong type', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .CompleteProfileStep').should('be.visible');

        // # Upload file
        cy.findByTestId('PictureSelector__input-CompleteProfileStep__profilePicture').attachFile('saml_users.json');

        // * Verify error message is displayed
        cy.get('.CompleteProfileStep__pictureError').should('contain', 'Photos must be in BMP, JPG or PNG format. Maximum file size is 50MB.');
    });

    it('MM-T3331_1 Sysadmin - Set team name and team icon', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // # Click Name your team header
        cy.get('button.NextStepsView__cardHeader:contains(Name your team)').should('be.visible').click();

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .TeamProfileStep').should('be.visible');

        // # Enter team name
        cy.get('#input_teamName').should('be.visible').clear().type('Wyld Stallyns');

        // # Select profile picture
        cy.findByTestId('PictureSelector__input-TeamProfileStep__teamIcon').attachFile('mattermost-icon.png');

        // # Click Save team button
        cy.findByTestId('TeamProfileStep__saveTeamButton').should('be.visible').and('not.be.disabled').click();

        // * Check to make sure card is collapsed and step is complete
        cy.get('.Card.complete .TeamProfileStep').should('exist');

        // * Step counter should increment
        cy.get('.SidebarNextSteps .SidebarNextSteps__middle').should('contain', '1 / 4 steps complete');
    });

    it('MM-T3331_2 Sysadmin - Set team name and team icon - no name provided', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // # Click Name your team header
        cy.get('button.NextStepsView__cardHeader:contains(Name your team)').should('be.visible').click();

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .TeamProfileStep').should('be.visible');

        // # Clear team name box
        cy.get('#input_teamName').should('be.visible').type('Wyld Stallyns').clear();

        // * Verify error message is displayed
        cy.get('.TeamProfileStep__textInputs .Input___error span').should('contain', 'Team name cannot be blank');

        // * Save team should be disabled
        cy.findByTestId('TeamProfileStep__saveTeamButton').should('be.disabled');
    });

    it('MM-T3331_3 Sysadmin - Set team name and team icon - upload file of wrong type', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // # Click Name your team header
        cy.get('button.NextStepsView__cardHeader:contains(Name your team)').should('be.visible').click();

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .TeamProfileStep').should('be.visible');

        // # Upload file
        cy.findByTestId('PictureSelector__input-TeamProfileStep__teamIcon').attachFile('saml_users.json');

        // * Verify error message is displayed
        cy.get('.TeamProfileStep__pictureError').should('contain', 'Photos must be in BMP, JPG or PNG format. Maximum file size is 50MB.');
    });
});
