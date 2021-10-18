// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @keyboard_shortcuts

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Keyboard Shortcuts', () => {
    let testTeam;
    let testChannel;
    let testUser;
    let otherUser;

    before(() => {
        cy.apiInitSetup().then(({team, channel, user}) => {
            testTeam = team;
            testChannel = channel;
            testUser = user;

            cy.apiCreateUser({prefix: 'other'}).then(({user: user1}) => {
                otherUser = user1;

                cy.apiAddUserToTeam(testTeam.id, otherUser.id).then(() => {
                    cy.apiAddUserToChannel(testChannel.id, otherUser.id);
                });
            });
        });
    });

    it('MM-T1236 Arrow up key - Edit modal open up for own message of a user', () => {
        const message1 = 'Test message from User 1';
        const message2 = 'Test message from User 2';

        cy.apiLogin(testUser);

        // # Visit the channel using the channel name
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // # Post message in the channel from User 1
        cy.postMessage(message1);
        cy.apiLogout();

        cy.apiLogin(otherUser);

        // # Visit the channel using the channel name
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // # Post message in the channel from User 2
        cy.postMessage(message2);
        cy.apiLogout();

        cy.apiLogin(testUser);
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // # Press UP arrow
        cy.get('#post_textbox').type('{uparrow}');

        // * Verify that the Edit Post Modal is visible
        cy.get('#editPostModal').should('be.visible');

        // * Verify that the Edit textbox contains previously sent message by user 1
        cy.get('#edit_textbox').should('have.text', message1);
    });

    it('MM-T1270 UP - Edit message with attachment but no text', () => {
        cy.apiLogin(testUser);

        // # Visit the channel using the channel name
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // # Upload file
        cy.get('#fileUploadInput').attachFile('mattermost-icon.png');

        // # Wait for file to upload
        cy.wait(TIMEOUTS.TWO_SEC);

        cy.get('#post_textbox').type('{enter}');

        cy.getLastPost().within(() => {
            // * Attachment should exist
            cy.get('.file-view--single').should('exist');

            // * Edited indicator should not exist
            cy.get('.post-edited__indicator').should('not.exist');
        });

        // # Press UP arrow
        cy.get('#post_textbox').type('{uparrow}');

        // # Add some text to the previous message and save
        cy.get('#edit_textbox').type('Test{enter}');

        cy.getLastPost().within(() => {
            // * Posted message should be correct
            cy.get('.post-message__text').should('contain.text', 'Test');

            // * Attachment should exist
            cy.get('.file-view--single').should('exist');

            // * Edited indicator should not exist
            cy.get('.post-edited__indicator').should('exist');
        });
    });
});
