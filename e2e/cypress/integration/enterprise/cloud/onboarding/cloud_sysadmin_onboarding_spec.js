// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @enterprise @onboarding @cloud_only

import {stubClipboard} from '../../../../utils';
import {spyNotificationAs} from '../../../../support/notification';

describe('Onboarding - Sysadmin', () => {
    let townSquarePage;
    let sysadmin;

    before(() => {
        cy.apiUpdateConfig({
            ServiceSettings: {EnableOnboardingFlow: true},
        });

        cy.apiInitSetup().then(({townSquareUrl}) => {
            townSquarePage = townSquareUrl;
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

    it('MM-T3326 Sysadmin - Happy Path', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // # Use to grant permission to Notification
        spyNotificationAs('withNotification', 'granted');

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .CompleteProfileStep').should('be.visible');

        // # Enter full name
        cy.get('#input_fullName').should('be.visible').clear().type('Theodore Logan');

        // # Select profile picture
        cy.findByTestId('PictureSelector__input-CompleteProfileStep__profilePicture').attachFile('mattermost-icon.png');

        // # Click Save profile button
        cy.findByTestId('CompleteProfileStep__saveProfileButton').should('be.visible').and('not.be.disabled').click();

        // * Step counter should increment
        cy.get('.SidebarNextSteps .SidebarNextSteps__middle').should('contain', '1 / 4 steps complete');

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .TeamProfileStep').should('be.visible');

        // # Enter team name
        cy.get('#input_teamName').should('be.visible').clear().type('Wyld Stallyns');

        // # Select profile picture
        cy.findByTestId('PictureSelector__input-TeamProfileStep__teamIcon').attachFile('mattermost-icon.png');

        // # Click Save team button
        cy.findByTestId('TeamProfileStep__saveTeamButton').should('be.visible').and('not.be.disabled').click();

        // * Step counter should increment
        cy.get('.SidebarNextSteps .SidebarNextSteps__middle').should('contain', '2 / 4 steps complete');

        // * Check to make sure card is expanded
        cy.findByText('We recommend enabling desktop notifications so you don’t miss any important communications.').should('be.visible');

        cy.findByRole('button', {name: 'Set up notifications'}).should('be.visible').click();

        // * Step counter should increment
        cy.get('.SidebarNextSteps .SidebarNextSteps__middle').should('contain', '3 / 4 steps complete');

        // * Check to make sure card is expanded
        cy.get('.Card__body.expanded .InviteMembersStep').should('be.visible');

        // # Click Finish button
        cy.findByTestId('InviteMembersStep__finishButton').should('be.visible').and('not.be.disabled').click();

        // * Should show Tips and Next Steps
        cy.get('#app-content').within(() => {
            cy.findByText('Tips & Next Steps').should('be.visible');
            cy.findByText('A few other areas to explore').should('be.visible');
        });

        cy.get('.SidebarNextSteps .SidebarNextSteps__top').should('contain', 'Tips & Next Steps');
        cy.get('.SidebarNextSteps .SidebarNextSteps__middle').should('contain', 'A few other areas to explore');

        // * Transition screen should be visible
        cy.get('.NextStepsView__transitionView.completed').should('be.visible');

        // * Completed screen should be visible
        cy.get('.NextStepsView__completedView.completed').should('be.visible');
    });

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
        cy.get('.SidebarNextSteps .SidebarNextSteps__middle').should('contain', '0 / 4 steps complete');
    });

    it('MM-T3328 Sysadmin - Skip Getting Started', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // * Check to make sure first card is expanded
        cy.get('.Card__body.expanded .CompleteProfileStep').should('be.visible');

        // # Click 'Skip Getting Started'
        cy.findByRole('button', {name: 'Skip Getting Started'}).scrollIntoView().should('be.visible').click();

        // * Main screen should be out of view and the completed screen should be visible
        cy.get('.NextStepsView__mainView.completed').should('exist');
        cy.get('.NextStepsView__completedView.completed').should('be.visible');
        cy.get('.SidebarNextSteps .SidebarNextSteps__middle').should('contain', 'A few other areas to explore');
    });

    it('MM-T3329 Sysadmin - Remove Recommended Next Steps', () => {
        // * Make sure channel view has loaded
        cy.url().should('include', townSquarePage);

        // * Check to make sure first card is expanded
        cy.findByText('Complete your profile').should('be.visible');

        // # Click the 'x' in the Sidebar Next Steps section
        cy.get('button.SidebarNextSteps__close').should('be.visible').click();

        // * Verify confirmation modal has appeared
        cy.get('.RemoveNextStepsModal').should('be.visible').should('contain', 'Remove Getting Started');

        // # Click 'Remove'
        cy.get('.RemoveNextStepsModal button.GenericModal__button.confirm').should('be.visible').click();

        // * Verify the sidebar section and the main view are gone and the channel view is back
        cy.get('.SidebarNextSteps').should('not.exist');
        cy.get('.app__content:not(.NextStepsView)').should('be.visible');

        // # Click 'Getting Started' in the help menu
        cy.uiOpenHelpMenu('Getting Started');

        // * Verify that sidebar element and next steps view are back
        cy.get('.SidebarNextSteps').should('be.visible');
        cy.get('.app__content.NextStepsView').should('be.visible');
    });

    it('MM-T3333 Sysadmin - Copy Invite Link', () => {
        cy.apiCreateTeam('team').then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);

            // # Stub out clipboard
            stubClipboard().as('clipboard');

            // # Get invite link
            const baseUrl = Cypress.config('baseUrl');
            const inviteLink = `${baseUrl}/signup_user_complete/?id=${team.invite_id}`;

            // * Verify initial state
            cy.get('@clipboard').its('wasCalled').should('eq', false);
            cy.get('@clipboard').its('contents').should('eq', '');

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
            cy.get('@clipboard').its('wasCalled').should('eq', true);
            cy.get('@clipboard').its('contents').should('eq', inviteLink);
        });
    });
});
