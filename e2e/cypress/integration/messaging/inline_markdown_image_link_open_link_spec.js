// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @messaging

describe('Messaging', () => {
    let testTeam;
    let testChannel;
    let testUser;

    before(() => {
        // # Login as test user and visit the newly created test channel
        cy.apiInitSetup({loginAfter: true}).then(({team, channel, user}) => {
            // # Visit a test channel
            cy.visit(`/${team.name}/channels/${channel.name}`);
        });
    });

    it('MM-T188 - Inline markdown image that is a link, opens the link', () => {
        // # Enable 'Show markdown preview option in message input box' setting in Account Settings > Advanced
        cy.get('.sidebar-header-dropdown__icon').click();
        cy.findByText('Account Settings').should('be.visible').click();
        cy.get('#advancedButton').should('be.visible').click();
        cy.get('#advancedPreviewFeaturesEdit').should('be.visible').click();
        cy.get('#advancedPreviewFeaturesmarkdown_preview').should('be.visible').check();
        cy.get('#saveSetting').should('be.visible').click();
        cy.reload();

        // # Post the provided Markdown text in the test channel
        cy.focused().type('[![Build Status](https://travis-ci.org/mattermost/platform.svg?branch=master)](https://travis-ci.org/mattermost/platform)').type('{enter}');

        cy.getLastPostId().then((postId) => {
            cy.get(`#postMessageText_${postId}`).find('a').then(($a) => {
                // * Check that the newly created post contains an a tag with the correct href link
                cy.wrap($a).should('have.attr', 'href', 'https://travis-ci.org/mattermost/platform');

                // # Check that the newly created post has the correct AltText
                cy.wrap($a).findByAltText('Build Status').should('exist');

                // # Assign the value of the a tag href to the 'href' variable and assert the link is valid
                // eslint-disable-next-line jquery/no-prop
                const href = $a.prop('href');
                cy.request(href).its('body').should('include', '</html>');
            },
            );
        });
    });
});
