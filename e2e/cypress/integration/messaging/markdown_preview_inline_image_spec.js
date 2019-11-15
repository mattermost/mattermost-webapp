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
        // # Login and go to off-topic to make sure we are in the channel, then go to /
        cy.apiLogin('user-1');
        cy.apiSaveShowMarkdownPreviewPreference();
        cy.visit('/');
    });

    it('M18714-Markdown preview: inline image', () => {
        const message = '![make it so](https://i.stack.imgur.com/MNeE7.jpg)'

        cy.visit('/ad-1/channels/town-square');

        // # Get the height before starting to write
        cy.get('#post_textbox').should('be.visible').clear().then(() => {
            cy.get('#post-create').then((postArea) => {
                cy.wrap(parseInt(postArea[0].clientHeight, 10)).as('initialHeight');
            })
        });

        // # Post first line to use
        cy.get('#post_textbox').type(message);

        // # Click on Preview button
        cy.get('#previewLink').click({force: true});

        // * Image does not overlap Post List
        cy.get('#post-list').then((postList) => {
            cy.get('.markdown-inline-img').then((img) => {
                expect(postList[0].getBoundingClientRect().bottom).lessThan(img[0].getBoundingClientRect().top);
            });
        });

        // * Post Create area should be higher than before
        cy.get('#post-create').then((postArea) => {
            cy.get('@initialHeight').should('be.lessThan', parseInt(postArea[0].clientHeight, 10));
        });
    });
});