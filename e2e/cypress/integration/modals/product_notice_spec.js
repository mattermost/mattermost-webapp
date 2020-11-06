// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @modals

// describe('MM-T3361 In product notices', () => {
//     let testTeam;
//     let testUser;
//
//     before(() => {
//         cy.apiInitSetup().then(({team, user}) => {
//             testTeam = team;
//             testUser = user;
//             cy.visit(`/${testTeam.name}/channels/town-square`);
//         });
//     });
//
//     it('MM-T3361_1 UI for miltiple notices', () => {
//         cy.visit(`/${testTeam.name}/channels/town-square`);
//
//         // * Verify that the notices modal is open
//         cy.get('[aria-labelledby="genericModalLabel"').should('be.visible').within(() => {
//             // * Verify the title for sysadmin
//             cy.get('#genericModalLabel').should('be.visible').and('contain', 'Sysadmin notice title');
//
//             // * Verify the description for sysadmin notice
//             cy.get('.productNotices__helpText p').should('be.visible').and('contain', 'your eyes only!');
//
//             // * Verify the action button text and the href of the link
//             cy.get('.GenericModal__body #actionButton').should('have.attr', 'href', 'https://github.com/mattermost/mattermost-server').and('contain', 'Download');
//
//             // * Verify that the previous button is not visible as this is the first notice
//             cy.get('.GenericModal__button.cancel').should('be.not.visible');
//
//             // * Verify that the sysadmin notice has info that it is  visible to only sysadmins
//             cy.get('.productNotices__info').within(() => cy.findByText('Visible to Admins only').should('be.visible'));
//
//             // * Verify that the first circle indicator circle has class active
//             cy.get('#tutorialIntroCircle0').should('have.class', 'active');
//
//             // * Verify that there is a next button and click on it
//             cy.findByText('Next').should('be.visible').click();
//
//             // * Verify the end user modal notice title
//             cy.get('#genericModalLabel').should('be.visible').and('contain', 'End user notice title');
//
//             // * Verify the end user modal notice description
//             cy.get('.productNotices__helpText p').should('be.visible').and('contain', 'End user notice description');
//
//             // * Verify the action button text and the href of the link
//             cy.get('.GenericModal__body #actionButton').should('have.attr', 'href', 'https://github.com/mattermost/mattermost-webapp').and('contain', 'Update');
//
//             // * Verify that the previous button is visible as this is the second notice
//             cy.get('.GenericModal__button.cancel').should('be.visible');
//
//             // * Verify that the second circle indicator circle has class active
//             cy.get('#tutorialIntroCircle1').should('have.class', 'active');
//
//             // * Verify that there is a done button and click on it
//             cy.findByText('Done').should('be.visible').click();
//         });
//
//         // * Verify that the notices modal is closed
//         cy.get('[aria-labelledby="genericModalLabel"').should('be.not.visible');
//         cy.reload();
//         cy.get('#postListContent').should('be.visible');
//
//         // * Verify that there is no notices modal
//         cy.get('[aria-labelledby="genericModalLabel"').should('be.not.visible');
//     });
//
//     it('MM-T3361_2 UI for end user notice', () => {
//         cy.apiLogout();
//
//         // # Login as test user and go to town square
//         cy.apiLogin(testUser);
//         cy.visit(`/${testTeam.name}/channels/town-square`);
//
//         // * Verify the end user modal notice title
//         cy.get('#genericModalLabel').should('be.visible').and('contain', 'End user notice title');
//
//         // * Verify the end user modal notice description
//         cy.get('.productNotices__helpText p').should('be.visible').and('contain', 'End user notice description');
//
//         // * Verify there is no action button
//         cy.get('.GenericModal__body #actionButton').should('be.not.visible');
//
//         // * Verify that the previous button is not visible as there is only one notice
//         cy.get('.GenericModal__button.cancel').should('be.not.visible');
//
//         // * Verify that there are no indicators
//         cy.get('.tutorial__circles').should('be.not.visible');
//
//         // * Verify that there is a done button and click on it
//         cy.findByText('Update').should('be.visible');
//     });
// });
