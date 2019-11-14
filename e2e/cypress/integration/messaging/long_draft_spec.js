// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

import * as TIMEOUTS from '../../fixtures/timeouts';

describe('Messaging', () => {
    before(() => {
        // # Make sure the viewport is the expected one, so written lines always create new lines
        cy.viewport(1000, 660);

        // # Login and go to off-topic to make sure we are in the channel, then go to /
        cy.apiLogin('user-1');
        cy.visit('/ad-1/channels/off-topic');
        cy.wait(TIMEOUTS.SMALL);
        cy.visit('/');
    });

    it('M18699-Leave a long draft in the main input box', () => {
        const lines = ['Lorem ipsum dolor sit amet,',
            'consectetur adipiscing elit.',
            'Nulla ac consectetur quam.',
            'Phasellus libero lorem,',
            'facilisis in purus sed, auctor.'];

        cy.visit('/ad-1/channels/town-square');

        // # Get the height before starting to write
        cy.get('#post_textbox').should('be.visible').clear().then((post) => {
            cy.wrap(parseInt(post[0].clientHeight, 10)).as('initialHeight').as('previousHeight');
        });

        // # Post first line to use
        cy.get('#post_textbox').type(lines[0]);

        // # For each line
        for (let i = 1; i < lines.length; i++) {
            // # Post the line
            cy.get('#post_textbox').type('{shift}{enter}').type(lines[i]);

            cy.get('#post_textbox').invoke('attr', 'height').then((height) => {
                // * Previous height should be lower than the current heigh
                cy.get('@previousHeight').should('be.lessThan', parseInt(height, 10));

                // # Store the current height as the previous height for the next loop
                cy.wrap(parseInt(height, 10)).as('previousHeight');
            });
        }

        // # Visit a different channel and verify textbox
        cy.get('#sidebarItem_off-topic').click({force: true});
        verifyPostTextbox('@initialHeight', '');

        // # Return to the channel and verify textbox
        cy.get('#sidebarItem_town-square').click({force: true});
        verifyPostTextbox('@previousHeight', lines.join('\n'));

        // # Clear the textbox
        cy.get('#post_textbox').clear();

        // # Write again all lines
        cy.get('#post_textbox').type(lines[0]);
        for (let i = 1; i < lines.length; i++) {
            cy.get('#post_textbox').type('{shift}{enter}').type(lines[i]);
        }

        // # Visit a different channel by URL and verify textbox
        cy.visit('/ad-1/channels/off-topic');
        verifyPostTextbox('@initialHeight', '');

        // # Return to the channel by URL and verify textbox
        cy.visit('/ad-1/channels/town-square');
        verifyPostTextbox('@previousHeight', lines.join('\n'));
    });
});

function verifyPostTextbox(targetHeightSelector, text) {
    cy.get('#post_textbox').should('be.visible').and('have.text', text).then((el) => {
        cy.get(targetHeightSelector).then((height) => {
            expect(el[0].clientHeight).to.equal(height);
        });
    });
}
