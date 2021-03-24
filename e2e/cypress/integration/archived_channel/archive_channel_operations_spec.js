// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @channel

import {getAdminAccount} from '../../support/env';
import {getRandomId} from '../../utils';

import {createArchivedChannel} from './helpers';

describe('Leave an archived channel', () => {
    let testTeam;
    let testChannel;
    let testUser;
    let adminUser;
    const testArchivedMessage = `this is an archived post ${getRandomId()}`;

    before(() => {
        adminUser = getAdminAccount();

        cy.apiUpdateConfig({
            TeamSettings: {
                ExperimentalViewArchivedChannels: true,
            },
        });

        // # Login as test user and visit town-square
        cy.apiInitSetup().then(({team, channel, user}) => {
            testTeam = team;
            testChannel = channel;
            testUser = user;

            cy.apiCreateUser({prefix: 'second'}).then(({user: second}) => {
                cy.apiAddUserToTeam(testTeam.id, second.id);
            });
            cy.visit(`/${team.name}/channels/${testChannel.name}`);
            cy.postMessageAs({sender: testUser, message: testArchivedMessage, channelId: testChannel.id});
        });
    });

    it('MM-T1704 Archived channels appear in channel switcher after refresh', () => {
        // # Archive the channel
        cy.apiLogin(testUser);
        cy.uiArchiveChannel();

        // # Switch to another channel
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Use CTRL / CMD+K shortcut to open channel switcher.
        cy.typeCmdOrCtrl().type('K', {release: true});

        // # Start typing the name of the archived channel in the search bar of the channel switcher
        cy.get('#quickSwitchInput').type(testChannel.display_name);

        // * The archived channel appears in channel switcher search results
        cy.get('#suggestionList').should('be.visible');
        cy.get('#suggestionList').find(`#switchChannel_${testChannel.name}`).should('be.visible');

        // # Reload the app (refresh the web page)
        cy.reload().then(() => {
            // # Return to the channel switcher
            cy.typeCmdOrCtrl().type('K', {release: true});

            // # Start typing the name of the archived channel in the search bar of the channel switcher
            cy.get('#quickSwitchInput').type(testChannel.display_name).then(() => {
                // * The archived channel appears in channel switcher search results
                cy.get('#suggestionList').should('be.visible');
                cy.get('#suggestionList').find(`#switchChannel_${testChannel.name}`).should('be.visible');
            });
        });
    });
    it('MM-T1705 User can unarchive a public channel', () => {
        // # As a user with appropriate permission, archive a public channel:
        cy.apiLogin(adminUser);

        cy.visit(`/${testTeam.name}/channels/off-topic`);
        cy.contains('#channelHeaderTitle', 'Off-Topic');

        const messageText = `archived text ${getRandomId()}`;

        createArchivedChannel({prefix: 'unarchive-'}, [messageText]).then(({name}) => {
            // # View the archived channel, noting that it is read-only
            cy.get('#post_textbox').should('not.be.visible');

            // # Unarchive the channel:
            cy.uiUnarchiveChannel();

            // * Channel is no longer read-only
            cy.get('#post_textbox').should('be.visible');

            // * Channel is displayed in LHS with the normal icon, not an archived channel icon
            cy.get(`#sidebarItem_${name}`).scrollIntoView().should('be.visible');

            cy.get(`#sidebarItem_${name} span`).should('have.class', 'icon__globe');
        });
    });

    it('MM-T1706 User can unarchive a private channel', () => {
        // # As a user with appropriate permission, archive a private channel:
        cy.apiLogin(adminUser);

        cy.visit(`/${testTeam.name}/channels/off-topic`);
        cy.contains('#channelHeaderTitle', 'Off-Topic');

        const messageText = `archived text ${getRandomId()}`;
        const channelOptions = {
            prefix: 'private-unarchive-',
            isPrivate: true,
        };

        createArchivedChannel(channelOptions, [messageText]).then(({name}) => {
            // # View the archived channel, noting that it is read-only
            cy.get('#post_textbox').should('not.be.visible');

            // # Unarchive the channel:
            cy.uiUnarchiveChannel().then(() => {
                // * Channel is no longer read-only
                cy.get('#post_textbox').should('be.visible');

                // * Channel is displayed in LHS with the normal icon, not an archived channel icon
                cy.get(`#sidebarItem_${name}`).should('be.visible');
                cy.get(`#sidebarItem_${name} span`).should('have.class', 'icon__lock');
            });
        });
    });
});
