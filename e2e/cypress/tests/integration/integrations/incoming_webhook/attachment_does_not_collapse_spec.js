// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @incoming_webhook

describe('Integrations/Incoming Webhook', () => {
    let testChannel;
    let otherUser;
    let incomingWebhook;

    before(() => {
        // # Create and visit new channel and create incoming webhook
        cy.apiInitSetup().then(({team, channel, user}) => {
            testChannel = channel;
            otherUser = user;

            const newIncomingHook = {
                channel_id: channel.id,
                channel_locked: true,
                description: 'Incoming webhook - non-collapsing attachment',
                display_name: 'non-collapsing-attachment',
            };

            cy.apiCreateWebhook(newIncomingHook).then((hook) => {
                incomingWebhook = hook;
            });

            cy.visit(`/${team.name}/channels/${channel.name}`);
        });
    });

    it('MM-T642 Attachment does not collapse', () => {
        // # Post the incoming webhook with a text attachment (lorem ipsum test text)
        const content = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
        const payload = {
            channel: testChannel,
            username: otherUser,
            attachments: [{text: content}],
        };
        cy.postIncomingWebhook({url: incomingWebhook.url, data: payload, waitFor: 'text'});
        // * Check that the webhook has posted
        cy.getLastPostId().then((postId) => {
            cy.get(`#${postId}_message`).should('exist').within(() => {
                // * Check if message text exists
                cy.findByText(content).should('exist');
            });
        });
        // # Type /collapse and press Enter
        const collapseCommand = 'collapse';
        cy.uiGetPostTextBox().type(`/${collapseCommand} {enter}`);
        // * Check that the post from the webhook has NOT collapsed (verify expanded post)
        cy.getLastPostId().then((postId) => {
            const postMessageId = `#${postId}_message`;
            cy.get(postMessageId).within(() => {
                verifyExpandedPost(postId);
            });
        });
    });
});

function verifyExpandedPost() {
    // * Verify show more button says 'Show less'
    cy.get('#showMoreButton').scrollIntoView().should('be.visible').and('have.text', 'Show less');

    // * Verify gradient
    cy.get('#collapseGradient').should('not.be.visible');
}
