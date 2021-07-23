// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @channel

import {getRandomId} from '../../utils';
import * as MESSAGES from '../../fixtures/messages';

describe('Archive a channel and its redirections', () => {
    let testTeam;
    let testUser;
    let testChannel;
    let testMessage;
    let messageList;

    before(() => {
        cy.apiUpdateConfig({
            TeamSettings: {
                ExperimentalViewArchivedChannels: true,
            },
        });
        cy.apiInitSetup().then(({team, channel, user}) => {
            testTeam = team;
            testChannel = channel;
            testUser = user;

            cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
            cy.contains('#channelHeaderTitle', `${testChannel.display_name}`).should('be.visible');

            testMessage = `I like pineaple #${getRandomId()}`;
            messageList = Array.from({length: 40}, (_, i) => `${i}. ${MESSAGES.SMALL} - ${getRandomId()}`);

            cy.postMessageAs({message: testMessage, sender: user, channelId: channel.id});
            messageList.forEach((message) => {
                cy.postMessageAs({message, sender: user, channelId: channel.id});
            });
        });
    });

    it('MM-T1714 Redirect to archived channel view', () => {
        cy.apiLogin(testUser);

        // # Create or locate a channel you're a member of
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);
        cy.contains('#channelHeaderTitle', `${testChannel.display_name}`).should('be.visible');

        // # Archive Channel
        cy.uiArchiveChannel();

        // * You should be redirected to archived channel view
        cy.get('#channelArchivedMessage').should('be.visible');
    });

    it('MM-T1715 Open Archive channel without permalink view', () => {
        cy.visit(`/${testTeam.name}/channels/off-topic`);
        cy.contains('#channelHeaderTitle', 'Off-Topic').should('be.visible');
        cy.findByText('Beginning of Off-Topic').should('be.visible');

        // # Search for "pineapple" (or the term you used in the above tests)
        cy.get('#searchBox').focus().clear();
        cy.get('#searchBox').should('be.visible').type(`${testMessage}{enter}`);

        // # Click "Jump" on one of the search results that's in an archived channel
        cy.get('#searchContainer').should('be.visible');

        cy.get('a.search-item__jump').first().click();

        // # Click on "You are viewing an archived channel. Click here to jump to recent messages."
        cy.get('.toast__jump').should('be.visible').click();

        // * User sees most recent posts in archived channel
        cy.findByText(messageList[messageList.length - 1]).should('be.visible');

        // * Channel name is visible in header with archived to the left of the channel name
        cy.contains('#channelHeaderTitle', testChannel.display_name).should('be.visible');

        // * Archived channel is displayed in the drawer
        cy.get(`#sidebarItem_${testChannel.name}`).should('be.visible');

        // * The bottom of channel shows a footer that says "You are viewing an archived channel. New messages cannot be posted." as well as a "Close Channel" button
        cy.get('#channelArchivedMessage').should('be.visible');
        cy.get('#post_textbox').should('not.be.visible');
    });
});

