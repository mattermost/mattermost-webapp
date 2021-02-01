// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

describe('Messaging', () => {
    before(() => {
        // # Login as test user and visit town-square channel
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            cy.visit(`/${team.name}/channels/town-square`);
        });
    });

    it('MM-T98 - Typing should show up right away when editing a message using the up arrow', () => {
        // # Post a message in the channel
        cy.postMessage('test post 1');

        // # Press the up arrow to open the edit modal
        cy.get('#post_textbox').type('{uparrow}');

        // # Immediately after opening the edit modal, type more text and assert that the text has been inputted
        cy.get('#edit_textbox').type(' and test post 2').should('have.text', 'test post 1 and test post 2');

        // # Click on the save button to edit the post
        cy.get('#editButton').click();

        // # Get the last post and check that none of the text was cut off after being edited
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('have.text', 'test post 1 and test post 2');
        });
    });
});
