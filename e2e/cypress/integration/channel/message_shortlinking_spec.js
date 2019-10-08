// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
describe('Message', () => {
    beforeEach(() => {
        // # Login as "user-1" and go to /
        cy.apiLogin('user-1');

        cy.visit('/');
    });

    it('M17451 Channel shortlinking still works when placed in brackets', () => {
        // # Post a shortlink of channel
        const shortLink = '(~saepe-5)';
        const longLink = '~doloremque';

        cy.postMessage(shortLink);

        cy.getLastPostId().then((postId) => {
            // # Grab last message with the long link url and go to the link
            const divPostId = `#postMessageText_${postId}`;
            cy.get(divPostId).contains(longLink).click();

            // * verify that the url is the same as what was just clicked on
            cy.location('pathname').should('contain', 'ad-1/channels/saepe-5');

            // * verify that the channel title represents the same channel that was clicked on
            cy.get('#channelHeaderTitle').should('contain', 'doloremque');
        });
    });
});
