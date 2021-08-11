// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @onboarding @smoke
const sel = {
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

    it('Takes the user through the steps of using the app', () => {
        // tip 1: post message
        cy.get(`#create_post ${sel.tip}`).click();
        cy.get(sel.tipText).should('be.visible').
            and('contain', 'Send a message');
        cy.get(sel.tipNext).click();

        // tip 2: channels
        cy.get(`#sidebarItem_town-square ${sel.tip}`).click();
        cy.get(sel.tipText).should('be.visible').
            and('contain', 'Organize conversations in channels');
        cy.get(sel.tipNext).click();

        // tip 3: add channels
        cy.get(`#lhsNavigator ${sel.tip}`).click();
        cy.get(sel.tipText).should('be.visible').
            and('contain', 'Create and join channels');
        cy.get(sel.tipNext).click();

        // tip 4: invite people/admin
        cy.get(`#sidebarHeaderDropdownButton ${sel.tip}`).click();
        cy.get(sel.tipText).should('be.visible').
            and('contain', 'Invite people');
        cy.get(sel.tipNext).click();
    });
});
