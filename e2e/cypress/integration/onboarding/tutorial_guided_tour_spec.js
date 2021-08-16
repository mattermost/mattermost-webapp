// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @onboarding @smoke

describe('Onboarding', () => {
    let testUser;
    let otherUser;
    let testTeam;

    // let config;

    before(() => {
        // cy.apiGetConfig().then((_data) => {
        cy.apiGetConfig().then(() => {
            // ({config} = data);
        });

        // # Set Support Email setting
        // const newSettings = {
        //     SupportSettings: {
        //         SupportEmail: 'feedback@mattermost.com',
        //     },
        // };
        // cy.apiUpdateConfig(newSettings);

        // # Create new team and new user and visit Town Square channel
        cy.apiInitSetup().then(({team}) => {
            testTeam = team;

            cy.apiCreateUser({bypassTutorial: false}).then(({user: user2}) => {
                otherUser = user2;
                cy.apiAddUserToTeam(testTeam.id, otherUser.id);
            });

            cy.apiCreateUser({bypassTutorial: false}).then(({user: user1}) => {
                testUser = user1;
                cy.apiAddUserToTeam(testTeam.id, testUser.id);

                cy.apiLogin(testUser);
                cy.visit(`/${testTeam.name}/channels/town-square`);
            });
        });
    });

    it('Takes the user through the steps of using the app', () => {
        // tip 1: post message
        cy.get('#create_post #tipButton').click();

        cy.get('.tip-overlay').should('be.visible').
            and('contain', 'Type your first message and select Enter to send it.');

        cy.get('#tipNextButton').click();

        // tip 2: channels
        // cy.get('#create_post #tipButton').click();
        //
        // cy.get('.tip-overlay').should('be.visible').
        //     and('contain', 'Type your first message and select Enter to send it.');
        //
        // cy.get('#tipNextButton').click();

        // tip 3: add channels
        // tip 4: admin
    });
});

