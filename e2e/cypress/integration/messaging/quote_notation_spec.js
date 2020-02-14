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
        cy.visit('/ad-1/channels/town-square');
    });

    it('M18704-Compact view: Markdown quotation', () => {
        const message = '>Hello' + Date.now();

        // # Create new DM channel with user's email
        cy.apiGetUsers(['user-1', 'sysadmin']).then((userResponse) => {
            const userEmailArray = [userResponse.body[1].id, userResponse.body[0].id];

            cy.apiCreateDirectChannel(userEmailArray).then(() => {
                cy.visit('/ad-1/messages/@sysadmin');

                // # Post first message in case it is a new Channel
                cy.postMessage('Hello' + Date.now());

                // # Make sure we are on compact mode
                cy.apiSaveMessageDisplayPreference('compact');

                resetRoot();

                // # Post message to use and check
                cy.postMessage(message);
                checkQuote(message);

                resetRoot();

                // # Post two messages and check
                cy.postMessage('Hello' + Date.now());
                cy.postMessage(message);
                checkQuote(message);
            });
        });
    });

    function resetRoot() {
        // # Write a message from SysAdmin to make sure we have the root on compact mode
        cy.apiLogout();
        cy.apiLogin('sysadmin');
        cy.visit('/ad-1/messages/@user-1');
        cy.postMessage('Hello' + Date.now());

        // # Get back to user-1
        cy.apiLogout();
        cy.apiLogin('user-1');
        cy.visit('/ad-1/messages/@sysadmin');
    }

    function checkQuote(message) {
        cy.getLastPostId().then((postId) => {
            // * Check if the message is the same sent
            cy.get(`#postMessageText_${postId} > blockquote > p`).should('be.visible').and('have.text', message.slice(1));
            cy.findAllByTestId('postView').filter('.other--root').last().find('.user-popover').then((userElement) => {
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
    }
});
