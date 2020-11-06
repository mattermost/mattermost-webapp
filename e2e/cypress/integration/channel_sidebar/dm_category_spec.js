// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @dm_category

import {getAdminAccount} from '../../support/env';
import * as TIMEOUTS from '../../fixtures/timeouts';

const SpaceKeyCode = 32;
const DownArrowKeyCode = 40;

describe('MM-T3156 DM category', () => {
    const sysadmin = getAdminAccount();
    let testUser;
    const usernames = [];
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
    });

    it('MM-T3156_1 Should open DM modal on click of + in category header', () => {
        cy.findByLabelText('DIRECT MESSAGES').parents('.SidebarChannelGroup').within(() => {
            cy.get('.SidebarChannelGroupHeader_addButton').click();
        });
        cy.get('#moreDmModal').should('be.visible');
        cy.get('#moreDmModal .close').click();
    });

    it('MM-T3156_2 should order DMs based on recent interactions', () => {
        const usersPrefixes = ['a', 'c', 'd', 'j', 'p', 'u', 'x', 'z'];
        usersPrefixes.forEach((prefix) => {
            // # Create users with prefixes in alphabetical order
            cy.apiCreateUser({prefix}).then(({user: newUser}) => {
                cy.apiCreateDirectChannel([testUser.id, newUser.id]).then(({channel}) => {
                    // # Post message in The DM channel
                    cy.postMessageAs({sender: newUser, message: 'test', channelId: channel.id});

                    // add usernames in array for reference
                    usernames.push(newUser.username);
                });
            });
        });

        // get DM category group
        cy.findByLabelText('DIRECT MESSAGES').parents('.SidebarChannelGroup').within(() => {
            const usernamesReversed = [...usernames].reverse();

            cy.get('.NavGroupContent').children().each(($el, index) => {
                // * Verify that the usernames are in reverse order i.e ordered by recent activity
                cy.wrap($el).find('.SidebarChannelLinkLabel').should('contain', usernamesReversed[index]);
            });
        });
    });

    it('MM-T3156_3 should order DMs alphabetically ', () => {
        // get DM category group
        cy.findByLabelText('DIRECT MESSAGES').parents('.SidebarChannelGroup').within(() => {
            // # Change sorting to be alphabetical
            cy.get('.SidebarChannelGroupHeader_sortButton').invoke('show').click().wait(TIMEOUTS.HALF_SEC);
            cy.get('.NavGroupContent').children().each(($el, index) => {
                // * Verify that the usernames are in alphabetical order
                cy.wrap($el).find('.SidebarChannelLinkLabel').should('contain', usernames[index]);
            });
        });
    });

    it('MM-T3156_4 should not be able to rearrange DMs', () => {
        cy.get('button[aria-label="DIRECT MESSAGES"]').parents('.SidebarChannelGroup').within(() => {
            // # Rearrange the first dm to be below second one
            cy.get(`.SidebarChannel:contains(${usernames[0]}) > .SidebarLink`).
                trigger('keydown', {keyCode: SpaceKeyCode}).
                trigger('keydown', {keyCode: DownArrowKeyCode, force: true}).wait(TIMEOUTS.THREE_SEC).
                trigger('keydown', {keyCode: SpaceKeyCode, force: true}).wait(TIMEOUTS.THREE_SEC);

            cy.get('.NavGroupContent').children().each(($el, index) => {
                // * Verify that the usernames are in alphabetical order
                cy.wrap($el).find('.SidebarChannelLinkLabel').should('contain', usernames[index]);
            });
        });
    });
});
