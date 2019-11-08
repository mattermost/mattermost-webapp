// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [number] indicates a test step (e.g. 1. Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

describe('Compact view: Markdown quotation', () => {
    before(() => {
        // # Login and go to /
        cy.apiLogin('user-1');
        cy.visit('/');
    });

    it('M18704-Compact view: Markdown quotation', () => {
        const message = '>Hello' + Date.now();

        // # Create new DM channel with user's email
        cy.apiGetUsers(['user-1', 'sysadmin']).then((userResponse) => {
            const userEmailArray = [userResponse.body[1].id, userResponse.body[0].id];

            cy.apiCreateDirectChannel(userEmailArray).then(() => {
                cy.visit('/ad-1/messages/@sysadmin');

                // # Post message to use
                cy.postMessage(message);

                // # Make sure we are on compact mode
                cy.apiSaveMessageDisplayPreference('compact');

                // # Reload the site to apply the changes on preferences
                cy.visit('/ad-1/messages/@sysadmin');

                cy.getLastPostId().then((postId) => {
                    // * Check if the message is the same sent
                    cy.get(`#postMessageText_${postId} > blockquote > p`).should('be.visible').and('have.text', message.slice(1));
                    cy.get(`#post_${postId}`).find('.user-popover').then((userElement) => {
                        // # Get the username bounding rect
                        const userRect = userElement[0].getBoundingClientRect();
                        cy.get(`#postMessageText_${postId}`).find('blockquote').then((quoteElement) => {
                            // # Get the quote block bounding rect
                            const blockQuoteRect = quoteElement[0].getBoundingClientRect();

                            // * We check the username rect does not collide with the quote rect
                            expect(userRect.right < blockQuoteRect.left || userRect.bottom < blockQuoteRect.top).to.equal(true);
                        });
                    });
                });
            });
        });
    });
});
