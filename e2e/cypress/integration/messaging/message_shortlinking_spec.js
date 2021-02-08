// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @messaging

describe('Message', () => {
    let testChannel;
    let testTeam;

    before(() => {
        // # Login as test user and go to town-square
        cy.apiInitSetup({loginAfter: true}).then(({team, channel}) => {
            testChannel = channel;
            testTeam = team;

            cy.visit(`/${testTeam.name}/channels/town-square`);
        });
    });

    it('MM-T175 Channel shortlinking still works when placed in brackets', () => {
        // # Post a shortlink of channel
        const shortLink = `(~${testChannel.name})`;
        const longLink = `~${testChannel.display_name}`;

        cy.postMessage(shortLink);

        cy.getLastPostId().then((postId) => {
            // # Grab last message with the long link url and go to the link
            const divPostId = `#postMessageText_${postId}`;
            cy.get(divPostId).contains(longLink).click();

            // * verify that the url is the same as what was just clicked on
            cy.location('pathname').should('contain', `${testTeam.name}/channels/${testChannel.name}`);

            // * verify that the channel title represents the same channel that was clicked on
            cy.get('#channelHeaderTitle').should('contain', testChannel.display_name);
        });
    });
});
