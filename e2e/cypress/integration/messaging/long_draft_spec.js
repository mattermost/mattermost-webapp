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

        // # Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('M18699-Leave a long draft in the main input box', () => {
        const lines = ['Lorem ipsum dolor sit amet,',
            '\nconsectetur adipiscing elit.',
            '\nNulla ac consectetur quam.',
            '\nPhasellus libero lorem,',
            '\nfacilisis in purus sed, auctor.'];

        // # Create new DM channel with user's email
        cy.apiGetUsers(['user-1', 'sysadmin']).then((userResponse) => {
            const userEmailArray = [userResponse.body[1].id, userResponse.body[0].id];
            cy.wrap(lines.reduce((prev, cur) => prev + cur, '')).as('fullText');

            cy.apiCreateDirectChannel(userEmailArray).then(() => {
                cy.visit('/ad-1/messages/@sysadmin');

                // # Get the height before starting to write
                cy.get('#post_textbox', {timeout: TIMEOUTS.LARGE}).type('a').clear();
                cy.get('#post_textbox').then((post) => {
                    cy.wrap(parseInt(post[0].clientHeight, 10)).as('previousHeight');
                });

                // # Post first line to use
                cy.get('#post_textbox').type(lines[0]);

                // # For each line
                for (var i = 1; i < lines.length; i++) {
                    // # Post the line
                    cy.get('#post_textbox').type(lines[i]);

                    cy.get('#post_textbox').invoke('attr', 'height').then((height) => {
                        // * Previous height should be lower than the current heigh
                        cy.get('@previousHeight').should('be.lessThan', parseInt(height, 10));

                        // # Store the current height as the previous height for the next loop
                        cy.wrap(parseInt(height, 10)).as('previousHeight');
                    });
                }

                cy.get('#sidebarChannelContainer').find('.active > a').then((element) => {
                    // # Get current channel ID to be able to come back
                    var currentChannelId = element[0].id;

                    // # Visit a different channel and come back by clicking
                    cy.get('#sidebarItem_town-square').click();
                    cy.get('#' + currentChannelId).click();
                });

                // # Wait for page to load
                cy.wait(TIMEOUTS.SMALL);

                // * Height should be the same as before
                cy.get('#post_textbox').invoke('attr', 'height').then((height) => {
                    cy.get('@previousHeight').should('equal', (parseInt(height, 10)));
                });

                // * Text should be the same as before
                cy.get('#post_textbox').invoke('val').then((text) => {
                    cy.get('@fullText').should('equal', text);
                });

                // # Clear the textbox
                cy.get('#post_textbox').clear();

                // # Write again all lines
                cy.get('@fullText').then((text) => {
                    cy.get('#post_textbox').type(text);
                });

                // # Visit a different channel and come back by URL
                cy.visit('/ad-1/channels/town-square');
                cy.visit('/ad-1/messages/@sysadmin');

                // # Wait for page to load
                cy.wait(TIMEOUTS.MEDIUM);

                // * Height should be the same as before
                cy.get('#post_textbox').invoke('attr', 'height').then((height) => {
                    cy.get('@previousHeight').should('equal', (parseInt(height, 10)));
                });

                // * Text should be the same as before
                cy.get('#post_textbox').invoke('val').then((text) => {
                    cy.get('@fullText').should('equal', text);
                });
            });
        });
    });
});
