// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @onboarding
// Skip:  @electron @chrome @firefox

const adminSteps = ['complete_profile', 'team_setup', 'invite_members', 'hide'];

describe('Cloud Onboarding - Sysadmin', () => {
    let townSquarePage;
    let sysadmin;

    before(() => {
        cy.apiUpdateConfig({
            ServiceSettings: {
                ExperimentalChannelSidebarOrganization: 'default_on',
            },
        });

        // # Check if with license and has matching database
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

        cy.apiSaveUserPreference(adminSteps.map((step) => ({...preference, name: step})));
        cy.visit(townSquarePage);
    });

    /*
     *  Happy Path
     */

    it('MM-T3326 Sysadmin - Happy Path', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .CompleteProfileStep').should('be.visible');

        // # Enter full name
        cy.get('#input_fullName').should('be.visible').clear().type('Theodore Logan');

        // # Select profile picture
        cy.findByTestId('PictureSelector__input-CompleteProfileStep__profilePicture').attachFile('mattermost-icon.png');

        // # Click Save profile button
        cy.findByTestId('CompleteProfileStep__saveProfileButton').should('be.visible').and('not.be.disabled').click();

        // * Step counter should increment
        cy.get('.SidebarNextSteps .SidebarNextSteps__middle').should('contain', '1 / 3 steps complete');

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .TeamProfileStep').should('be.visible');

        // # Enter team name
        cy.get('#input_teamName').should('be.visible').clear().type('Wyld Stallyns');

        // # Select profile picture
        cy.findByTestId('PictureSelector__input-TeamProfileStep__teamIcon').attachFile('mattermost-icon.png');

        // # Click Save team button
        cy.findByTestId('TeamProfileStep__saveTeamButton').should('be.visible').and('not.be.disabled').click();

        // * Step counter should increment
        cy.get('.SidebarNextSteps .SidebarNextSteps__middle').should('contain', '2 / 3 steps complete');

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .InviteMembersStep').should('be.visible');

        // # Click Finish button
        cy.findByTestId('InviteMembersStep__finishButton').should('be.visible').and('not.be.disabled').click();

        // * Step counter should show Tips and Next Steps
        cy.get('.SidebarNextSteps .SidebarNextSteps__top').should('contain', 'Tips & Next Steps');
        cy.get('.SidebarNextSteps .SidebarNextSteps__middle').should('contain', 'A few other areas to explore');

        // * Transition screen should be visible
        cy.get('.NextStepsView__transitionView.completed').should('be.visible');

        // * Completed screen should be visible
        cy.get('.NextStepsView__completedView.completed').should('be.visible');
    });

    /*
     *  General functionality
     */

    it('MM-T3327 Sysadmin - Switch to Next Step', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .CompleteProfileStep').should('be.visible');

        // # Click the header of the next card
        cy.get('.Card.expanded + .Card button.NextStepsView__cardHeader').should('be.visible').click();

        // * Check to make sure next card is expanded and current card is collapsed
        cy.get('.Card__body:not(.expanded) .CompleteProfileStep').should('exist').should('not.be.visible');
        cy.get('.Card__body.expanded .TeamProfileStep').should('exist').should('be.visible');

        // * Step counter should not increment
        cy.get('.SidebarNextSteps .SidebarNextSteps__middle').should('contain', '0 / 3 steps complete');
    });

    it('MM-T3328 Sysadmin - Skip Getting Started', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // * Check to make sure first card is expanded
        cy.get('.Card__body.expanded .CompleteProfileStep').should('be.visible');

        // # Click 'Skip Getting Started'
        cy.get('.NextStepsView__skipGettingStarted button').should('be.visible').click();

        // * Main screen should be out of view and the completed screen should be visible
        cy.get('.NextStepsView__mainView.completed').should('exist');//.should('not.be.visible');
        cy.get('.NextStepsView__completedView.completed').should('be.visible');

        // * Step counter should not increment
        cy.get('.SidebarNextSteps .SidebarNextSteps__middle').should('contain', '0 / 3 steps complete');
    });

    it('MM-T3329 Sysadmin - Remove Recommended Next Steps', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // * Check to make sure first card is expanded
        cy.get('.Card__body.expanded .CompleteProfileStep').should('be.visible');

        // # Click the 'x' in the Sidebar Next Steps section
        cy.get('button.SidebarNextSteps__close').should('be.visible').click();

        // * Verify confirmation modal has appeared
        cy.get('.RemoveNextStepsModal').should('be.visible').should('contain', 'Remove Getting Started');

        // # Click 'Remove'
        cy.get('.RemoveNextStepsModal button.GenericModal__button.confirm').should('be.visible').click();

        // * Verify the sidebar section and the main view are gone and the channel view is back
        cy.get('.SidebarNextSteps').should('not.exist');
        cy.get('.app__content:not(.NextStepsView)').should('be.visible');

        // # Click 'Getting Started' in the main menu
        cy.get('#sidebarHeaderDropdownButton').should('be.visible').click();
        cy.get('.dropdown-menu .MenuItem:contains(Getting Started)').scrollIntoView().should('be.visible').click();

        // * Verify that sidebar element and next steps view are back
        cy.get('.SidebarNextSteps').should('be.visible');
        cy.get('.app__content.NextStepsView').should('be.visible');
    });

    /*
     *  Complete Profile Step
     */

    it('MM-T3330_1 Sysadmin - Set full name and profile image', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // # Clear full name
        cy.apiPatchUser(sysadmin.id, {first_name: '', last_name: ''}).then(() => {
            // * Check to make sure card is expanded
            cy.get('.Card__body.expanded .CompleteProfileStep').should('be.visible');

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
            cy.get('.SidebarNextSteps .SidebarNextSteps__middle').should('contain', '1 / 3 steps complete');
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
        cy.get('.CompleteProfileStep__fullName .Input___error span').should('contain', 'Your name can’t be blank');

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

    /*
     *  Team Profile Step
     */

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
        cy.get('.SidebarNextSteps .SidebarNextSteps__middle').should('contain', '1 / 3 steps complete');
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
        cy.get('.TeamProfileStep__textInputs .Input___error span').should('contain', 'Team name can’t be blank');

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

    /*
     *  Invite Members Step
     */
    it('MM-T3332_1 Sysadmin - Invite members by email', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // # Click Invite members to the team header
        cy.get('button.NextStepsView__cardHeader:contains(Invite members to the team)').should('be.visible').click();

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .InviteMembersStep').should('be.visible');

        // * Verify that Send button is disabled until emails are entered
        cy.findByTestId('InviteMembersStep__sendButton').should('be.disabled');

        // # Enter email addresses
        cy.get('#MultiInput_InviteMembersStep__membersListInput input').should('be.visible').type('bill.s.preston@wyldstallyns.com,theodore.logan@wyldstallyns.com,', {force: true});
        cy.get('#MultiInput_InviteMembersStep__membersListInput input').should('be.visible').type('joanna.preston@wyldstallyns.com elizabeth.logan@wyldstallyns.com ', {force: true});

        // # Click Send
        cy.findByTestId('InviteMembersStep__sendButton').should('not.be.disabled').click();

        // * Verify that 4 invitations were sent
        cy.get('.InviteMembersStep__invitationResults').should('contain', '4 invitations sent');
    });

    it('MM-T3332_2 Sysadmin - Invite members by email - invalid emails', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // # Click Invite members to the team header
        cy.get('button.NextStepsView__cardHeader:contains(Invite members to the team)').should('be.visible').click();

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .InviteMembersStep').should('be.visible');

        // # Enter email addresses
        cy.get('#MultiInput_InviteMembersStep__membersListInput input').should('be.visible').type('bill.s.preston@wyldstallyns.com,theodoreloganwyldstallynscom,', {force: true});

        // # Click Send
        cy.findByTestId('InviteMembersStep__sendButton').should('not.be.disabled').click();

        // * Verify that the error message shows
        cy.get('.InviteMembersStep__invitationResults').should('contain', 'One or more email addresses are invalid');
    });

    it('MM-T3332_3 Sysadmin - Invite members by email - invite more than 10 emails', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // # Click Invite members to the team header
        cy.get('button.NextStepsView__cardHeader:contains(Invite members to the team)').should('be.visible').click();

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .InviteMembersStep').should('be.visible');

        // # Enter email addresses
        cy.get('#MultiInput_InviteMembersStep__membersListInput input').should('be.visible').type('a@b.c,b@c.d,c@d.e,d@e.f,e@f.g,f@g.h,g@h.i,h@i.j,i@j.k,j@k.l,k@l.m,', {force: true});

        // * Verify that the error message shows
        cy.get('.InviteMembersStep__invitationResults').should('contain', 'Invitations are limited to 10 email addresses.');

        // * Verify that Send button is disabled until only 10 emails remain
        cy.findByTestId('InviteMembersStep__sendButton').should('be.disabled');

        // # Remove the last email
        cy.get('#MultiInput_InviteMembersStep__membersListInput input').should('be.visible').type('{backspace}');

        // * Verify that Send button is now enabled
        cy.findByTestId('InviteMembersStep__sendButton').should('not.be.disabled');
    });

    it('MM-T3333 Sysadmin - Copy Invite Link', () => {
        cy.apiCreateTeam('team').then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);

            // # Stub out clipboard
            const clipboard = {link: '', wasCalled: false};
            cy.window().then((win) => {
                cy.stub(win.navigator.clipboard, 'writeText', (link) => {
                    clipboard.wasCalled = true;
                    clipboard.link = link;
                });
            });

            // # Get invite link
            const baseUrl = Cypress.config('baseUrl');
            const inviteLink = `${baseUrl}/signup_user_complete/?id=${team.invite_id}`;

            // * Verify initial state
            cy.wrap(clipboard).its('link').should('eq', '');

            // * Make sure channel view has loaded
            cy.url().should('include', `/${team.name}/channels/town-square`);

            // # Click Invite members to the team header
            cy.get('button.NextStepsView__cardHeader:contains(Invite members to the team)').should('be.visible').click();

            // * Check to make sure card is expanded
            cy.get('.Card__body.expanded .InviteMembersStep').should('be.visible');

            // * Verify correct invite link is displayed
            cy.findByTestId('InviteMembersStep__shareLinkInput').should('be.visible').and('have.value', `${baseUrl}/signup_user_complete/?id=${team.invite_id}`);

            // # Click Copy Link
            cy.findByTestId('InviteMembersStep__shareLinkInputButton').should('be.visible').and('contain', 'Copy Link').click();

            // * Verify that button reads Copied
            cy.findByTestId('InviteMembersStep__shareLinkInputButton').should('be.visible').and('contain', 'Copied');

            // * Verify if it's called with correct link value
            cy.wrap(clipboard).its('wasCalled').should('eq', true);
            cy.wrap(clipboard).its('link').should('eq', inviteLink);
        });
    });
});
