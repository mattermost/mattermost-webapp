// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable no-warning-comments */

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @onboarding @smoke

describe('Onboarding', () => {
    let theuser;
    let theteam;
    before(() => {
        // # Create new team and new user and visit Town Square channel
        cy.apiInitSetup().then(({team}) => {
            theteam = team;
            cy.apiCreateUser({bypassTutorial: false}).then(({user}) => {
                cy.apiAddUserToTeam(team.id, user.id);
                theuser = user;
                cy.apiLogin(user);
            });
        });
    });

    beforeEach(() => {
        const preferences = [{
            name: theuser.id,
            user_id: theuser.id,
            category: 'tutorial_step',
            value: '0',
        }];

        cy.apiSaveUserPreference(preferences, theuser.id);
        cy.visit(`/${theteam.name}/channels/town-square`);
    });

    it('MM-T4643 Takes the user through the steps of using the app', () => {
        // * Check that 'Town Square' is currently being selected
        cy.get('.active').within(() => {
            cy.get('#sidebarItem_town-square').should('exist');
        });

        cy.get('.tour-tip__pulsating-dot-ctr').should('exist').click();

        // # Click next tip
        cy.findByText('Channels and direct messages');
        cy.findByText('Next').click();

        // # Click next tip
        cy.findByText('Create and join channels');
        cy.findByText('Next').click();

        // # Click next tip
        cy.findByText('Invite people to the team');
        cy.findByText('Next').click();

        // # Click next tip
        cy.findByText('Send messages');
        cy.findByText('Next').click();

        // # Click next tip
        cy.findByText('Customize your experience');
        cy.findByText('Done').click();
    });

    it('MM-T4644 Takes the user through the steps of using the app using the ENTER key', () => {
        // # Close the posting messages tip by pressing ENTER key
        cy.findByText('Channels and direct messages');
        cy.get('body').type('{enter}');

        cy.findByText('Create and join channels');
        cy.get('body').type('{enter}');

        cy.findByText('Invite people to the team');
        cy.get('body').type('{enter}');

        cy.findByText('Send messages');
        cy.get('body').type('{enter}');

        cy.findByText('Customize your experience');
        cy.get('body').type('{enter}');
    });
});
