// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @accessibility

import users from '../../fixtures/users.json';

const otherUser = users['user-1'];

// * Verify the accessibility support in the different images

describe('Verify Accessibility Support in Different Images', () => {
    before(() => {
        cy.apiLogin('sysadmin');

        // Visit the Off Topic channel
        cy.visit('/ad-1/channels/off-topic');
    });

    it('MM-24075 Accessibility support in different images', () => {
        // * Verify image alt in profile image
        cy.get('#lhsHeader').should('be.visible').within(() => {
            cy.get('.Avatar').should('have.attr', 'alt', 'user profile image');
        });

        // # Upload an image in the post
        cy.fileUpload('#fileUploadInput', 'small-image.png');
        cy.postMessage('Image upload');

        // * Verify accessibility in images uploaded in a post
        cy.getLastPostId().then((postId) => {
            cy.get(`#${postId}_message`).within(() => {
                cy.get('img').should('be.visible').should('have.attr', 'aria-label', 'file thumbnail small-image.png');
            });
        });

        // # Post a message as a different user
        cy.getCurrentChannelId().then((channelId) => {
            cy.apiGetUserByEmail(otherUser.email).then((emailResponse) => {
                cy.apiAddUserToChannel(channelId, emailResponse.body.id);
                const message = `hello from ${otherUser.username}: ${Date.now()}`;
                cy.postMessageAs({sender: otherUser, message, channelId});
            });
        });

        // # Open profile popover
        cy.getLastPostId().then((postId) => {
            cy.get(`#post_${postId}`).within(() => {
                cy.get('.user-popover').click();
            });

            // * Verify image alt in profile popover
            cy.get('#user-profile-popover').within(() => {
                cy.get('.Avatar').should('have.attr', 'alt', `${otherUser.username} profile image`);
            });
        });

        // # Open Account Settings > Display > Themes
        cy.toAccountSettingsModal();
        cy.get('#displayButton').click();
        cy.get('#displaySettingsTitle').should('exist');
        cy.get('#themeTitle').should('be.visible');
        cy.get('#themeEdit').click();

        // * Verify image alt in Theme Images
        cy.get('#displaySettings').within(() => {
            cy.get('.appearance-section>div').children().each(($el) => {
                cy.wrap($el).find('img').should('be.visible').invoke('attr', 'alt').should('not.be.empty');
            });
        });
    });
});
