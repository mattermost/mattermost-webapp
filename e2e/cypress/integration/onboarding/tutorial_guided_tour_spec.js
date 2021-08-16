// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @onboarding @smoke
const selectors = {
    tip: '#tipButton',
    tipNext: '#tipNextButton',
    tipText: '.tip-overlay',
}

describe('Onboarding', () => {
    before(() => {
        // # Create new team and new user and visit Town Square channel
        cy.apiInitSetup().then(({team}) => {
            cy.apiCreateUser({bypassTutorial: false}).then(({user}) => {
                cy.apiAddUserToTeam(team.id, user.id);

                cy.apiLogin(user);
                cy.visit(`/${team.name}/channels/town-square`);
            });
        });
    });

    it('MM-T4148 Takes the user through the steps of using the app', () => {
        // # Click the tip on posting messages
        cy.get(`#create_post ${selectors.tip}`).click();

        // * Observe the help on posting messages is visible
        cy.get(selectors.tipText).should('be.visible').
            and('contain', 'Send a message');

        // # Close the posting messages tip
        cy.get(selectors.tipNext).click();

        // # Click the tip on channels
        cy.get(`#sidebarItem_town-square ${selectors.tip}`).click();

        // * Observe the help on channels is visible
        cy.get(selectors.tipText).should('be.visible').
            and('contain', 'Organize conversations in channels');

        // # Close the channels tip
        cy.get(selectors.tipNext).click();

        // # Click the tip on creating and joining channels
        cy.get(`#lhsNavigator ${selectors.tip}`).click();

        // * Observe the help on creating and joining channels is visible
        cy.get(selectors.tipText).should('be.visible').
            and('contain', 'Create and join channels');

        // # Close the creating and joining channels tip
        cy.get(selectors.tipNext).click();

        // # Click the tip on admin UI and inviting people
        cy.get(`#sidebarHeaderDropdownButton ${selectors.tip}`).click();

        // * Observe the help on admin UI and inviting people is visible
        cy.get(selectors.tipText).should('be.visible').
            and('contain', 'Invite people');

        // # Close the admin UI and inviting people tip
        cy.get(selectors.tipNext).click();
    });
});
