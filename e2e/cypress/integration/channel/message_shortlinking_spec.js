// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
describe('Message', () => {
    beforeEach(() => {
        // # Login as "user-1" and go to /
        cy.apiLogin('user-1');

        cy.visit('/');
    });

    it('M17451 Channel shortlinking still works when placed in brackets', () => {
        // # Post shortlink of channel
        const shortLink = '(~saepe-5)';
        const longLink = '~doloremque';

        cy.postMessage(shortLink);

        // # Grab element with the long link url and go to the link
        cy.get('a.mention-link').contains(longLink).click();

        // * verify that the url is the same as what was just clicked on
        const URLRegularEx = /\/ad-[0-9]+\/channels\/saepe-5/;
        cy.location('pathname').should('match', URLRegularEx);

        // * verify that the channel title represents the same channel that was clicked on
        cy.get('#channelHeaderTitle').should('contain', 'doloremque');
    });
});
