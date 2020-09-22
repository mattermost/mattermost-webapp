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
        // # Login as test user and visit test channel
        cy.apiInitSetup({loginAfter: true}).then(({team, channel, user}) => {
            cy.visit(`/${team.name}/channels/${channel.name}`);

            Cypress._.times(30, (i) => {
                cy.postMessageAs({sender: user, message: `[${i}]`, channelId: channel.id});
            });
        });
    });

    it('MM-T207 Input box on main thread can expand with RHS closed', () => {
        // # Check whether the RHS Close button exist, and click it in case it exist.
        cy.get('body').then((body) => {
            if (body.find('rhsCloseButton').length) {
                cy.get('#rhsCloseButton').click({force: true});
            }
        });

        // * Confirm the RHS is not shown since there is no Close Button
        cy.get('#rhsCloseButton').should('not.exist');

        // # Get initial height of the post textbox
        cy.get('#post_textbox').should('be.visible').clear();
        cy.get('#post_textbox').then((post) => {
            cy.wrap(parseInt(post[0].clientHeight, 10)).as('previousHeight');
        });

        // # Scroll to latest post
        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).scrollIntoView();
        });

        // # Write lines until maximum height
        for (let i = 0; i < 13; i++) {
            // # Post the line
            cy.get('#post_textbox').type('{shift}{enter}');

            cy.get('#post_textbox').then((post) => {
                const height = parseInt(post[0].clientHeight, 10);

                // * Previous height should be lower than the current height
                cy.get('@previousHeight').should('be.lessThan', height);

                // # Store the current height as the previous height for the next loop
                cy.wrap(height).as('previousHeight');
            });
        }

        // * Check that height does not keep increasing.
        cy.get('#post_textbox').type('{shift}{enter}');
        cy.get('#post_textbox').then((post) => {
            const height = parseInt(post[0].clientHeight, 10);
            cy.get('@previousHeight').should('equal', height);
        });

        cy.getNthPostId(-1).then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('be.visible');
        });

        // # Clear textbox to test from a different post
        cy.get('#post_textbox').should('be.visible').clear();

        // # Scroll to a previous post
        cy.getNthPostId(-29).then((postId) => {
            cy.get(`#postMessageText_${postId}`).scrollIntoView();
        });

        // #  Again, write lines until the textbox reaches the maximum height
        for (let i = 0; i < 14; i++) {
            cy.get('#post_textbox').type('{shift}{enter}');
        }

        // * Previous post should be visible
        cy.getNthPostId(-29).then((postId) => {
            cy.get(`#postMessageText_${postId}`).should('be.visible');
        });
    });
});
