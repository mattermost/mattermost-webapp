// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Group: @channel

import {getRandomId} from '../../utils';

describe('Leave an archived channel', () => {
    let testTeam;
    let testChannel;
    let testUser;
    let otherUser;
    const testArchivedMessage = `this is an archived post ${getRandomId()}`;

    before(() => {
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
                otherUser = second;
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
});
