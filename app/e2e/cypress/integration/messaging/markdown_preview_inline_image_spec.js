// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging @markdown

describe('Messaging', () => {
    let townsquareLink;

    before(() => {
        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            townsquareLink = `/${team.name}/channels/town-square`;
            cy.apiSaveShowMarkdownPreviewPreference();
            cy.visit(townsquareLink);
        });
    });

    it('MM-T186 Markdown preview: inline image', () => {
        const message = '![make it so](https://i.stack.imgur.com/MNeE7.jpg)';

        cy.visit(townsquareLink);

        // # Get the height before starting to write
        cy.get('#post_textbox').should('be.visible').clear().then(() => {
            cy.get('#post-create').then((postArea) => {
                cy.wrap(parseInt(postArea[0].clientHeight, 10)).as('initialHeight');
            });
        });

        // # Post first line to use
        cy.get('#post_textbox').type(message).type('{shift}{enter}').type(message);

        // # Click on Preview button
        cy.get('#previewLink').click({force: true});

        cy.get('#post-list').then((postList) => {
            cy.get('#create_post').within(() => {
                cy.get('.markdown-inline-img').then((img) => {
                    // * Images do not overlap Post List
                    expect(postList[0].getBoundingClientRect().bottom).lessThan(img[0].getBoundingClientRect().top);
                    expect(postList[0].getBoundingClientRect().bottom).lessThan(img[1].getBoundingClientRect().top);

                    // * Images do not overlap among themselves
                    expect(img[0].getBoundingClientRect().bottom <= img[1].getBoundingClientRect().top).equals(true);
                });
            });
        });

        // * Post Create area should be higher than before
        cy.get('#post-create').then((postArea) => {
            cy.get('@initialHeight').should('be.lessThan', parseInt(postArea[0].clientHeight, 10));
        });
    });
});
