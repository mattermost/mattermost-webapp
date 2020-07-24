// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @channel_sidebar

import {getAdminAccount} from '../../support/env';

describe('Channel sidebar', () => {
    const sysadmin = getAdminAccount();
    let testUser;
    before(() => {
        // # Enable channel sidebar organization
        cy.apiUpdateConfig({
            ServiceSettings: {
                ExperimentalChannelSidebarOrganization: 'default_on',
            },
        });

        // # Login as test user and visit town-square
        cy.apiInitSetup({loginAfter: true}).then(({team, user}) => {
            testUser = user;
            cy.visit(`/${team.name}/channels/town-square`);

            // # upgrade user to sys admin role
            cy.externalRequest({user: sysadmin, method: 'put', path: `users/${user.id}/roles`, data: {roles: 'system_user system_admin'}});
        });

        // # Close "What's new" modal
        cy.uiCloseWhatsNewModal();
    });

    it('should order DMs based on the sort button', () => {
        const usersPrefixes = ['a', 'c', 'd', 'j', 'p', 'u', 'x', 'z'];
        const usernames = [];
        usersPrefixes.forEach((prefix) => {
            // # Create users with prefixes in alphabatical order
            cy.apiCreateUser({prefix}).then(({user: newUser}) => {
                cy.apiCreateDirectChannel([testUser.id, newUser.id]).then((res) => {
                    const channel = res.body;

                    // # Post messaege in The DM channel
                    cy.postMessageAs({sender: newUser, message: 'test', channelId: channel.id});

                    // add usernames in array for reference
                    usernames.push(newUser.username);
                });
            });
        });

        // get DM category group
        cy.get('button[aria-label="DIRECT MESSAGES"]').parents('.SidebarChannelGroup').within(() => {
            const usernamesReversed = usernames.reverse();

            cy.get('.NavGroupContent').children().each(($el, index) => {
                // * Verify that the usernames are in reverse order i.e ordered by recent activity
                cy.wrap($el).find('.SidebarChannelLinkLabel').should('contain', usernamesReversed[index]);
            });

            // # Change sorting to be alphabetical
            cy.get('.SidebarChannelGroupHeader_sortButton').invoke('show').click();
            cy.get('.NavGroupContent').children().each(($el, index) => {
                // * Verify that the usernames are in alphabetical order
                cy.wrap($el).find('.SidebarChannelLinkLabel').should('contain', usernames[index]);
            });
        });
    });
});
