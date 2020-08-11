// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***********************************************************  ****

// Group: @messaging

describe('Messaging', () => {
    let testTeam;
    let firstUser;
    let secondUser;

    before(() => {
        // # Login as test user
        cy.apiInitSetup().then(({team, user}) => {
            firstUser = user;
            testTeam = team;

            // # Create a second user that will be searched
            cy.apiCreateUser().then(({user: user1}) => {
                secondUser = user1;
                cy.apiAddUserToTeam(testTeam.id, secondUser.id);
            });

            cy.apiLogin(firstUser);

            // # Visit created test team
            cy.visit(`/${testTeam.name}`);
        });
    });

    it('MM-T3294 - CTRL/CMD+K - Open DM using mouse', () => {
        // # Type either cmd+K / ctrl+K depending on OS and type in the first character of the second user's name
        cy.get('#post_textbox').cmdOrCtrlShortcut('K');
        cy.get('#quickSwitchInput').should('be.visible').type(secondUser.username.charAt(0));

        // # Scroll to the second user and click to start a DM
        cy.get(`#switchChannel_${secondUser.username}`).scrollIntoView().click();

        // # Type in a message in the automatically focused message box, logout as the first user and login as the second user
        cy.focused().type(`Hi there, ${secondUser.username}!`).type('{enter}');
        cy.apiLogout();
        cy.reload();
        cy.apiLogin(secondUser);

        // * Check that the DM exists
        cy.get('#directChannelList').should('be.visible').within(() => {
            cy.findByLabelText(`${firstUser.username} 1 mention`).should('exist');
        });
    });
});
