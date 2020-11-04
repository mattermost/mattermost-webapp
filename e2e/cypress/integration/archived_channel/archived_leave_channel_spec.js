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

    it('should leave recently archived channel', () => {
        cy.apiLogin(testUser);

        // # Archive the channel
        cy.uiArchiveChannel();

        // # Switch to another channel
        cy.visit(`/${testTeam.name}/channels/town-square`);

        // # Switch back to the archived channel
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // # Leave the channel
        cy.get('#channelHeaderDropdownIcon').click();
        cy.get('#channelLeaveChannel').click();

        // * Verify sure that we have switched channels
        cy.get('#channelHeaderTitle').should('not.contain', testChannel.display_name);
    });

    it('MM-T1670 Can view channel info for an archived channel', () => {
        // # Visit archived channel
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // # Click the channel header
        cy.get('#channelHeaderDropdownButton button').click();

        // # Select View Info
        cy.get('#channelViewInfo button').click();

        // * Channel title is shown with archived icon
        cy.get('#channelInfoModalLabel span.icon__archive').should('be.visible');
        cy.contains('#channelInfoModalLabel strong', `${testChannel.display_name}`).should('be.visible');

        // * Channel URL is listed (non-linked text)
        cy.url().then((loc) => {
            cy.contains('div.info__value', loc).should('be.visible');
        });
    });

    it('MM-T1671 Can view members', () => {
        // # Open an archived channel
        cy.visit(`/${testTeam.name}/channels/${testChannel.name}`);

        // # Click the channel header
        cy.get('#channelHeaderDropdownButton button').click();

        // # Select "View Members"
        cy.get('#channelViewMembers button').click();

        // * Channel Members modal opens
        cy.get('div#channelMembersModal').should('be.visible');

        // # Ensure there are no options to change channel roles or membership
        // * Membership or role cannot be changed
        cy.findByTestId('userListItemActions').should('not.be.visible');

        // # Use search box to refine list of members
        // * Search box works as before to refine member list
        cy.findAllByTestId('userListItemDetails').its('length').then((fullListLength) => {
            cy.get('#searchUsersInput').type(`${testUser.first_name}{enter}`);
            cy.findByTestId('userListItemDetails').its('length').then((filteredLength) => {
                expect(fullListLength).to.be.greaterThan(filteredLength);
            });
        });
    });
    it('MM-T1672_1 User can close archived channel (1/2)', () => {
        // # Open a channel that's not the town square
        cy.visit(`/${testTeam.name}/channels/off-topic`);

        // # repeat searching and navigating to the archived channel steps 3 times.
        [1, 2, 3].forEach((i) => {
            // * ensure we are not on an archived channel
            cy.get('#channelInfoModalLabel span.icon__archive').should('not.be.visible');

            // # Search for a post in an archived channel
            cy.get('#searchBox').focus().clear();

            cy.get('#searchBox').should('be.visible').type(`${testArchivedMessage}{enter}`);

            // # Open the archived channel by selecting Jump from search results and then selecting the link to move to the most recent posts in the channel
            cy.get('#searchContainer').should('be.visible');

            cy.get('a.search-item__jump').first().click();

            cy.get(`#sidebarItem_${testChannel.name}`).should('be.visible');

            cy.url().should('satisfy', (testUrl) => {
                return testUrl.endsWith(`${testTeam.name}/channels/${testChannel.name}`); // wait for permalink to turn into channel url
            });

            if (i < 3) {
                // # Close an archived channel by clicking "Close Channel" button in the footer
                cy.get('#channelArchivedMessage button').click();
            } else {
                // # Click the header menu and select Close Channel
                cy.get('#channelHeaderDropdownButton button').click();
                cy.contains('li.MenuItem', 'Close Channel').click();
            }

            // * The user is returned to the channel they were previously viewing and the archived channel is removed from the drawer
            cy.get(`#sidebarItem_${testChannel.name}`).should('not.be.visible');
            cy.url().should('include', `${testTeam.name}/channels/off-topic`);
        });
    });
    it('MM-T1672_2 User can close archived channel (2/2)', () => {
        // # Add text to channel you land on (after closing the archived channel via Close Channel button)
        // * Able to add test
        cy.postMessage('some text');
        cy.getLastPostId().then((postId) => {
            cy.get(`#${postId}_message`).should('be.visible');
        });
    });

    it('MM-T1673 Close channel after viewing two archived channels in a row', () => {
        const messageText = `archived text ${getRandomId()}`;

        cy.apiCreateChannel(testTeam.id, 'archived-is-not', 'archived-is-not');

        // # Create another channel with text and archive it
        createArchivedChannel({prefix: 'archive-'}, [messageText]).then(() => {
            cy.visit(`/${testTeam.name}/channels/off-topic`);

            // # Search for content from an archived channel
            cy.get('#searchBox').should('be.visible').clear().type(`${testArchivedMessage}{enter}`);

            // # Open the channel from search results
            cy.get('#searchContainer').should('be.visible');
            cy.get('#loadingSpinner').should('not.be.visible');

            cy.get('a.search-item__jump').first().click();

            cy.url().should('satisfy', (testUrl) => {
                return testUrl.endsWith(`${testTeam.name}/channels/${testChannel.name}`); // wait for permalink to turn into channel url
            });

            // # Search for content from a different archived channel
            cy.get('#searchBox').should('be.visible').clear().type(`${messageText}{enter}`);

            // # Open that channel from search results
            cy.get('#searchContainer').should('be.visible');

            cy.get('a.search-item__jump').first().click();

            cy.url().should('satisfy', (testUrl) => {
                return testUrl.match(/\/team-\w+\/channels\/archive-\w+$/); // wait for permalink to turn into channel url
            });

            // # Select "Close Channel"
            cy.get('#channelArchivedMessage button').click();

            // * User is returned to previously viewed (non-archived) channel
            cy.url().should('include', `${testTeam.name}/channels/off-topic`);
        });
    });

    it('MM-T1674 CTRL/CMD+K list public archived channels you are a member of', () => {
        createArchivedChannel({prefix: 'archived-'}, [`some text message ${getRandomId()}`]);
        cy.visit(`/${testTeam.name}/channels/off-topic`);

        // # Select CTRL/⌘+k) to open the channel switcher
        cy.typeCmdOrCtrl().type('K', {release: true});

        // # Start typing the name of a private channel on this team that has been archived which the test user belongs to
        cy.get('#quickSwitchInput').type('archived-');

        // * Suggestion list should be visible
        cy.get('#suggestionList').should('be.visible');

        // * there should be public channels as well
        cy.get('#suggestionList').find('.icon-globe').should('be.visible');
    });

    it('MM-T1675 CTRL/CMD+K list private archived channels you are a member of', () => {
        cy.visit(`/${testTeam.name}/channels/off-topic`);

        // # Select CTRL/⌘+k) to open the channel switcher
        cy.typeCmdOrCtrl().type('K', {release: true});

        // # Start typing the name of a private channel on this team that has been archived which the test user belongs to
        cy.get('#quickSwitchInput').type('archived-');

        // * Suggestion list should be visible
        cy.get('#suggestionList').should('be.visible');

        // * there should be public channels as well
        cy.get('#suggestionList').find('.icon-archive-outline').should('be.visible');
    });

    it('MM-T1676 CTRL/CMD+K does not show private archived channels you are not a member of', () => {
        const otherChannelName = 'archived-not-mine';

        // # As another user, create or locate a private channel that the test user is not a member of and archive the channel
        cy.apiLogout();
        cy.apiLogin(otherUser);
        cy.visit(`/${testTeam.name}/channels/off-topic`);
        cy.contains('#channelHeaderTitle', 'Off-Topic');
        createArchivedChannel({prefix: otherChannelName}, [`some text message ${getRandomId()}`]).then(() => {
            // # As the test user, select CTRL/CMD+K (or ⌘+k) to open the channel switcher
            cy.apiLogout();
            cy.apiLogin(testUser);
            cy.visit(`/${testTeam.name}/channels/off-topic`);
            cy.contains('#channelHeaderTitle', 'Off-Topic');
            cy.typeCmdOrCtrl().type('K', {release: true});

            // # Start typing the name of a private channel located above
            cy.get('#quickSwitchInput').type('archived-');

            cy.get('#suggestionList').should('be.visible');

            // * Private archived channels you are not a member above are not available on channel switcher
            cy.contains('#suggestionList', otherChannelName).should('not.exist');
            cy.get('#quickSwitchModalLabel button.close').click();
        });
    });
});

function createArchivedChannel(channelOptions, messages, memberUsernames) {
    let channelName;
    cy.uiCreateChannel(channelOptions).then((newChannel) => {
        channelName = newChannel.name;
        if (memberUsernames) {
            cy.uiAddUsersToCurrentChannel(memberUsernames);
        }
        if (messages) {
            let messageList = messages;
            if (!Array.isArray(messages)) {
                messageList = [messages];
            }
            messageList.forEach((message) => {
                cy.postMessage(message);
            });
        }
        return cy.uiArchiveChannel();
    });
    return cy.wrap({channelName});
}
