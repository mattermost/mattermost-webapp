// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @channel

describe('Archived channels', () => {
    before(() => {
        cy.apiUpdateConfig({
            TeamSettings: {
                ExperimentalViewArchivedChannels: true,
            },
        });

        // # Login as test user and visit create channel
        cy.apiInitSetup({loginAfter: true}).then(({team, channel}) => {
            cy.visit(`/${team.name}/channels/${channel.name}`);
        });
    });

    it('MM-T1716 Text box in center channel and in RHS should not be visible', () => {
        // * Post text box should be visible
        cy.get('#post_textbox').should('be.visible');

        // # Post a message in the channel
        cy.postMessage('Test archive reply');
        cy.clickPostCommentIcon();

        // * RHS should be visible
        cy.get('#rhsContainer').should('be.visible');

        // * RHS text box should be visible
        cy.get('#reply_textbox').should('be.visible');

        // # Archive the channel
        cy.uiArchiveChannel();

        // * Post text box should not be visible
        cy.get('#post_textbox').should('not.be.visible');

        // * RHS text box should not be visible
        cy.get('#reply_textbox').should('not.be.visible');
    });
});
