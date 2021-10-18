// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

describe('Show GIF images properly', () => {
    let offtopiclink;

    before(() => {
        // # Set the configuration on Link Previews
        cy.apiUpdateConfig({
            ServiceSettings: {
                EnableLinkPreviews: true,
            },
        });

        // # Login as test user and visit off-topic
        cy.apiInitSetup({loginAfter: true}).then(({team}) => {
            offtopiclink = `/${team.name}/channels/off-topic`;
            cy.visit(offtopiclink);
        });
    });

    it('MM-T3318 Posting GIFs', () => {
        // # Got to a test channel on the side bar
        cy.get('#sidebarItem_off-topic').click({force: true});

        // * Validate if the channel has been opened
        cy.url().should('include', offtopiclink);

        // # Post tenor GIF
        cy.postMessage('https://media1.tenor.com/images/4627c6507cdc899d211319081ba5740b/tenor.gif');

        cy.getLastPostId().as('postId').then((postId) => {
            // * Validate image size
            cy.get(`#post_${postId}`).find('.attachment__image').should('have.css', 'width', '320px');
        });

        // # Post giphy GIF
        cy.postMessage('https://media.giphy.com/media/XIqCQx02E1U9W/giphy.gif');

        cy.getLastPostId().as('postId').then((postId) => {
            // * Validate image size
            cy.get(`#post_${postId}`).find('.attachment__image').invoke('outerWidth').should('be.gte', 480);
        });
    });
});
