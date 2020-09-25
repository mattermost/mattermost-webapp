// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @messaging

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Messaging', () => {
    let testTeam;

    before(() => {
        // # Make sure the viewport is the expected one, so written lines always create new lines
        cy.viewport(1000, 660);

        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            testTeam = team;
            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    it('MM-T211 Leave a long draft in the main input box', () => {
        const lines = [
            'Lorem ipsum dolor sit amet,',
            'consectetur adipiscing elit.',
            'Nulla ac consectetur quam.',
            'Phasellus libero lorem,',
            'facilisis in purus sed, auctor.',
        ];

        cy.visit(`/${testTeam.name}/channels/town-square`);
        cy.postMessage('Hello');

        // # Get the height before starting to write
        cy.get('#post_textbox').should('be.visible').clear().invoke('height').as('initialHeight').as('previousHeight');

        // # Write all lines
        writeLinesToPostTextBox(lines);

        // # Visit a different channel and verify textbox
        cy.get('#sidebarItem_off-topic').click({force: true}).wait(TIMEOUTS.THREE_SEC);
        verifyPostTextbox('@initialHeight', '');

        // # Return to the channel and verify textbox
        cy.get('#sidebarItem_town-square').click({force: true}).wait(TIMEOUTS.THREE_SEC);
        verifyPostTextbox('@previousHeight', lines.join('\n'));

        // # Clear the textbox
        cy.get('#post_textbox').clear();
        cy.postMessage('World!');

        // # Write all lines again
        cy.get('@initialHeight').as('previousHeight');
        writeLinesToPostTextBox(lines);

        // # Visit a different channel by URL and verify textbox
        cy.visit(`/${testTeam.name}/channels/off-topic`).wait(TIMEOUTS.THREE_SEC);
        verifyPostTextbox('@initialHeight', '');

        // # Should have returned to the channel by URL. However, Cypress is clearing storage for some reason.
        // # Does not happened on actual user interaction.
        // * Verify textbox
        cy.get('#sidebarItem_town-square').click({force: true}).wait(TIMEOUTS.THREE_SEC);
        verifyPostTextbox('@previousHeight', lines.join('\n'));
    });
});

function writeLinesToPostTextBox(lines) {
    for (let i = 0; i < lines.length; i++) {
        // # Add the text
        cy.get('#post_textbox').type(lines[i], {delay: TIMEOUTS.ONE_HUNDRED_MILLIS}).wait(TIMEOUTS.HALF_SEC);
        if (i < lines.length - 1) {
            // # Add new line
            cy.get('#post_textbox').type('{shift}{enter}').wait(TIMEOUTS.HALF_SEC);

            // * Verify new height
            cy.get('#post_textbox').invoke('height').then((height) => {
                // * Verify previous height should be lower than the current height
                cy.get('@previousHeight').should('be.lessThan', parseInt(height, 10));

                // # Store the current height as the previous height for the next loop
                cy.wrap(parseInt(height, 10)).as('previousHeight');
            });
        }
    }
}

function verifyPostTextbox(heightSelector, text) {
    cy.get('#post_textbox').should('be.visible').and('have.text', text).invoke('height').then((currentHeight) => {
        cy.get(heightSelector).should('be.gte', currentHeight);
    });
}
